const Shipment = require('../models/Shipment');
const PickupLocation = require('../models/PickupLocation');
const Merchant = require('../models/Merchant');
const WalletTransaction = require('../models/WalletTransaction');
const Manifest = require('../models/Manifest');
const { getRateComparison, calculateCarrierRate, CARRIERS, getZone } = require('../services/courier/rateEngine');
const { generateAwb, generatePickupToken, getNextSimulatedStatus } = require('../services/courier/mockCourierEngine');
const { generateThermalLabelHtml } = require('../services/labelGenerator');
const { generateManifestHtml } = require('../services/manifestGenerator');

exports.listShipments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;
    const filter = { merchant: req.merchant._id };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'courier.awbNumber': new RegExp(search, 'i') },
        { 'buyer.name': new RegExp(search, 'i') },
        { 'buyer.phone': new RegExp(search, 'i') },
      ];
    }

    const total = await Shipment.countDocuments(filter);
    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Stats summary counts
    const counts = await Shipment.aggregate([
      { $match: { merchant: req.merchant._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
      TOTAL: total,
      READY_TO_SHIP: 0,
      AWB_ASSIGNED: 0,
      PICKUP_SCHEDULED: 0,
      IN_TRANSIT: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      NDR_FAILED: 0,
      RTO: 0,
    };

    counts.forEach((c) => {
      if (stats[c._id] !== undefined) stats[c._id] = c.count;
      if (c._id.startsWith('RTO_')) stats.RTO += c.count;
    });

    res.json({ success: true, shipments, total, stats, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id }).populate(
      'pickupLocation'
    );
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createShipment = async (req, res) => {
  try {
    const { orderNumber, pickupLocationId, buyer, packageDetails, items, payment } = req.body;

    if (!orderNumber || !buyer?.name || !buyer?.phone || !buyer?.addressLine1 || !buyer?.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide order number and recipient address' });
    }

    let pickup = null;
    if (pickupLocationId) {
      pickup = await PickupLocation.findOne({ _id: pickupLocationId, merchant: req.merchant._id });
    }
    if (!pickup) {
      pickup = await PickupLocation.findOne({ merchant: req.merchant._id, isPrimary: true });
    }
    if (!pickup) {
      pickup = await PickupLocation.findOne({ merchant: req.merchant._id });
    }

    if (!pickup) {
      return res.status(400).json({
        success: false,
        message: 'No pickup warehouse found. Please add a pickup location first under Warehouses.',
      });
    }

    const dead = Number(packageDetails?.deadWeight || 0.5);
    const vol =
      (Number(packageDetails?.length || 20) *
        Number(packageDetails?.breadth || 15) *
        Number(packageDetails?.height || 5)) /
      5000;
    const billable = Math.max(dead, vol);

    const isCod = payment?.mode === 'COD';
    const subtotal = Number(payment?.subtotal || payment?.collectableAmount || 100);

    const shipment = await Shipment.create({
      merchant: req.merchant._id,
      orderNumber,
      pickupLocation: pickup._id,
      pickupAddressSnapshot: {
        locationNickname: pickup.locationNickname,
        contactPerson: pickup.contactPerson,
        phone: pickup.phone,
        addressLine1: pickup.addressLine1,
        addressLine2: pickup.addressLine2,
        pincode: pickup.pincode,
        city: pickup.city,
        state: pickup.state,
      },
      buyer: {
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email || '',
        addressLine1: buyer.addressLine1,
        addressLine2: buyer.addressLine2 || '',
        city: buyer.city || 'City',
        state: buyer.state || 'State',
        pincode: buyer.pincode,
      },
      packageDetails: {
        length: Number(packageDetails?.length || 20),
        breadth: Number(packageDetails?.breadth || 15),
        height: Number(packageDetails?.height || 5),
        deadWeight: dead,
        volumetricWeight: Number(vol.toFixed(2)),
        billableWeight: Number(billable.toFixed(2)),
      },
      items: items && items.length > 0 ? items : [{ name: 'Apparel Item', units: 1, sellingPrice: subtotal }],
      payment: {
        mode: isCod ? 'COD' : 'PREPAID',
        collectableAmount: isCod ? Number(payment?.collectableAmount || subtotal) : 0,
        subtotal,
      },
      status: 'READY_TO_SHIP',
      trackingTimeline: [
        {
          status: 'ORDER_CREATED',
          activity: 'Order manifests on LogixWave Logistics Network',
          location: pickup.city,
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({ success: true, message: 'Shipment created successfully', shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignAwb = async (req, res) => {
  try {
    const { carrierId } = req.body;
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (shipment.status !== 'READY_TO_SHIP' && shipment.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: `Shipment already assigned AWB: ${shipment.courier?.awbNumber}` });
    }

    const carrierConfig = CARRIERS.find((c) => c.id === carrierId) || CARRIERS[0];
    const zone = getZone(shipment.pickupAddressSnapshot?.pincode || '226010', shipment.buyer.pincode);
    const rateCalc = calculateCarrierRate(
      carrierConfig,
      zone,
      shipment.packageDetails.billableWeight,
      shipment.payment.mode === 'COD',
      shipment.payment.collectableAmount
    );

    // Wallet balance verification & freight deduction
    const merchant = await Merchant.findById(req.merchant._id);
    if (merchant.walletBalance < rateCalc.totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Total courier freight is ₹${rateCalc.totalCost}, but your current wallet balance is ₹${merchant.walletBalance}. Please recharge your wallet.`,
      });
    }

    const prevBal = merchant.walletBalance;
    const newBal = prevBal - rateCalc.totalCost;
    merchant.walletBalance = newBal;
    await merchant.save();

    const awb = generateAwb(carrierConfig.id);

    await WalletTransaction.create({
      merchant: merchant._id,
      type: 'DEBIT_FREIGHT',
      amount: rateCalc.totalCost,
      balanceBefore: prevBal,
      balanceAfter: newBal,
      description: `Freight charges for Order #${shipment.orderNumber} via ${rateCalc.carrierName}`,
      referenceId: awb,
      status: 'SUCCESS',
    });

    shipment.courier = {
      carrier: rateCalc.carrierName,
      courierId: carrierConfig.id,
      rate: rateCalc.totalCost,
      etdDays: rateCalc.etdDays,
      awbNumber: awb,
    };
    shipment.payment.freightCharge = rateCalc.freightCharge;
    shipment.payment.codCharge = rateCalc.codCharge;
    shipment.payment.totalShippingCost = rateCalc.totalCost;
    shipment.status = 'AWB_ASSIGNED';

    shipment.trackingTimeline.push({
      status: 'AWB_ASSIGNED',
      activity: `AWB ${awb} generated with ${rateCalc.carrierName}`,
      location: shipment.pickupAddressSnapshot?.city || 'Warehouse',
      timestamp: new Date(),
    });

    await shipment.save();

    res.json({
      success: true,
      message: `AWB ${awb} assigned successfully via ${rateCalc.carrierName}`,
      shipment,
      newWalletBalance: newBal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.schedulePickup = async (req, res) => {
  try {
    const { pickupDate } = req.body;
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (!shipment.courier?.awbNumber) {
      return res.status(400).json({ success: false, message: 'Please assign an AWB before scheduling pickup' });
    }

    const token = generatePickupToken(shipment.courier.courierId || 'del');
    const scheduledDate = pickupDate ? new Date(pickupDate) : new Date();

    shipment.courier.pickupToken = token;
    shipment.courier.pickupDate = scheduledDate;
    shipment.status = 'PICKUP_SCHEDULED';

    shipment.trackingTimeline.push({
      status: 'PICKUP_SCHEDULED',
      activity: `Courier pickup scheduled (Token #${token})`,
      location: shipment.pickupAddressSnapshot?.city || 'Warehouse',
      timestamp: new Date(),
    });

    await shipment.save();

    res.json({
      success: true,
      message: `Pickup scheduled successfully for ${scheduledDate.toLocaleDateString()} (Token: ${token})`,
      shipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.printLabel = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!shipment) {
      return res.status(404).send('Shipment not found');
    }

    const html = generateThermalLabelHtml(shipment);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createManifest = async (req, res) => {
  try {
    const { shipmentIds, carrier } = req.body;
    if (!shipmentIds || shipmentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No shipments selected for manifest' });
    }

    const shipments = await Shipment.find({
      _id: { $in: shipmentIds },
      merchant: req.merchant._id,
      status: { $in: ['AWB_ASSIGNED', 'PICKUP_SCHEDULED'] },
    });

    if (shipments.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible shipments found to manifest' });
    }

    const totalWeight = shipments.reduce((sum, s) => sum + (s.packageDetails?.billableWeight || 0.5), 0);
    const manifestNumber = 'MNF-' + Date.now();

    const manifest = await Manifest.create({
      merchant: req.merchant._id,
      manifestNumber,
      pickupLocation: shipments[0].pickupLocation,
      carrier: carrier || shipments[0].courier?.carrier || 'Delhivery Express',
      shipments: shipments.map((s) => s._id),
      totalShipments: shipments.length,
      totalWeight: Number(totalWeight.toFixed(2)),
    });

    await Shipment.updateMany(
      { _id: { $in: shipments.map((s) => s._id) } },
      { $set: { manifestId: manifest._id, status: 'PICKUP_SCHEDULED' } }
    );

    res.json({
      success: true,
      message: `Handover Manifest #${manifestNumber} generated for ${shipments.length} packages`,
      manifest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listManifests = async (req, res) => {
  try {
    const manifests = await Manifest.find({ merchant: req.merchant._id })
      .populate('pickupLocation')
      .sort({ createdAt: -1 });
    res.json({ success: true, manifests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.simulateMilestone = async (req, res) => {
  try {
    const { targetStatus, location, customActivity } = req.body;
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    let nextStep = null;
    if (targetStatus) {
      nextStep = {
        status: targetStatus,
        activity: customActivity || `Shipment transitioned to ${targetStatus}`,
      };
    } else {
      nextStep = getNextSimulatedStatus(shipment.status);
    }

    if (!nextStep) {
      return res.status(400).json({ success: false, message: `Shipment is already in final state: ${shipment.status}` });
    }

    shipment.status = nextStep.status;
    if (nextStep.status === 'NDR_FAILED') {
      shipment.ndrDetails.isNdr = true;
      shipment.ndrDetails.lastNdrReason = customActivity || 'Customer not reachable at delivery address';
      shipment.ndrDetails.attemptsCount += 1;
    } else if (nextStep.status === 'DELIVERED') {
      shipment.ndrDetails.isNdr = false;
    }

    shipment.trackingTimeline.push({
      status: nextStep.status,
      activity: nextStep.activity,
      location: location || shipment.buyer.city || 'In Transit Hub',
      timestamp: new Date(),
    });

    await shipment.save();

    res.json({
      success: true,
      message: `Shipment advanced to: ${nextStep.status}`,
      shipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handleNdrAction = async (req, res) => {
  try {
    const { action, notes, newPincode, newAddress } = req.body; // 'RE_ATTEMPT' | 'UPDATE_ADDRESS' | 'RTO'
    const shipment = await Shipment.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (action === 'RTO') {
      shipment.status = 'RTO_INITIATED';
      shipment.ndrDetails.buyerAction = 'RTO';
      shipment.ndrDetails.notes = notes || 'Merchant requested Return to Origin (RTO)';
      shipment.trackingTimeline.push({
        status: 'RTO_INITIATED',
        activity: 'Package marked for Return to Origin (RTO)',
        location: shipment.buyer.city,
        timestamp: new Date(),
      });
    } else if (action === 'UPDATE_ADDRESS') {
      if (newAddress) shipment.buyer.addressLine1 = newAddress;
      if (newPincode) shipment.buyer.pincode = newPincode;
      shipment.status = 'OUT_FOR_DELIVERY';
      shipment.ndrDetails.buyerAction = 'UPDATE_ADDRESS';
      shipment.ndrDetails.notes = `Address updated: ${newAddress || ''}`;
      shipment.trackingTimeline.push({
        status: 'OUT_FOR_DELIVERY',
        activity: `Address updated by merchant. Re-attempting delivery. Notes: ${notes || ''}`,
        location: shipment.buyer.city,
        timestamp: new Date(),
      });
    } else {
      // RE_ATTEMPT
      shipment.status = 'OUT_FOR_DELIVERY';
      shipment.ndrDetails.buyerAction = 'RE_ATTEMPT';
      shipment.ndrDetails.notes = notes || 'Customer requested next-day reattempt';
      shipment.trackingTimeline.push({
        status: 'OUT_FOR_DELIVERY',
        activity: `Next delivery attempt scheduled. Instruction: ${notes || 'Reattempt delivery'}`,
        location: shipment.buyer.city,
        timestamp: new Date(),
      });
    }

    await shipment.save();

    res.json({
      success: true,
      message: `NDR action '${action}' recorded. Courier notified!`,
      shipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.printManifest = async (req, res) => {
  try {
    const manifest = await Manifest.findOne({ _id: req.params.id, merchant: req.merchant._id }).populate('pickupLocation');
    if (!manifest) {
      return res.status(404).send('Manifest not found');
    }

    const shipments = await Shipment.find({ _id: { $in: manifest.shipments } });
    const pickup = manifest.pickupLocation || {};

    const html = generateManifestHtml(manifest, shipments, pickup);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createBulkShipments = async (req, res) => {
  try {
    const { shipments: incomingShipments, pickupLocationId } = req.body;
    if (!Array.isArray(incomingShipments) || incomingShipments.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of shipments is required in payload' });
    }

    let pickup = null;
    if (pickupLocationId) {
      pickup = await PickupLocation.findOne({ _id: pickupLocationId, merchant: req.merchant._id });
    }
    if (!pickup) {
      pickup = (await PickupLocation.findOne({ merchant: req.merchant._id, isPrimary: true })) ||
               (await PickupLocation.findOne({ merchant: req.merchant._id }));
    }

    if (!pickup) {
      return res.status(400).json({
        success: false,
        message: 'No pickup warehouse found. Please register a warehouse first.',
      });
    }

    const createdList = [];
    const errors = [];

    for (let i = 0; i < incomingShipments.length; i++) {
      const s = incomingShipments[i];
      try {
        const dead = Number(s.packageDetails?.deadWeight || s.deadWeight || s.weight || 0.5);
        const l = Number(s.packageDetails?.length || s.length || 20);
        const b = Number(s.packageDetails?.breadth || s.breadth || 15);
        const h = Number(s.packageDetails?.height || s.height || 5);
        const vol = (l * b * h) / 5000;
        const billable = Math.max(dead, vol);

        const isCod = s.payment?.mode === 'COD' || s.paymentMode === 'COD';
        const subtotal = Number(s.payment?.subtotal || s.amount || 500);

        const created = await Shipment.create({
          merchant: req.merchant._id,
          orderNumber: s.orderNumber || `ORD-BULK-${Date.now()}-${i + 1}`,
          pickupLocation: pickup._id,
          pickupAddressSnapshot: {
            locationNickname: pickup.locationNickname,
            contactPerson: pickup.contactPerson,
            phone: pickup.phone,
            addressLine1: pickup.addressLine1,
            addressLine2: pickup.addressLine2,
            pincode: pickup.pincode,
            city: pickup.city,
            state: pickup.state,
          },
          buyer: {
            name: s.buyer?.name || s.buyerName || s.name || 'Customer',
            phone: s.buyer?.phone || s.buyerPhone || s.phone || '9999999999',
            email: s.buyer?.email || s.buyerEmail || s.email || '',
            addressLine1: s.buyer?.addressLine1 || s.addressLine1 || s.address || 'Address',
            addressLine2: s.buyer?.addressLine2 || s.addressLine2 || '',
            city: s.buyer?.city || s.city || 'Delhi',
            state: s.buyer?.state || s.state || 'Delhi',
            pincode: s.buyer?.pincode || s.pincode || '110001',
          },
          packageDetails: {
            length: l,
            breadth: b,
            height: h,
            deadWeight: dead,
            volumetricWeight: Number(vol.toFixed(2)),
            billableWeight: Number(billable.toFixed(2)),
          },
          items: s.items && s.items.length > 0 ? s.items : [{
            name: s.itemName || 'Merchandise Item',
            sku: s.itemSku || 'SKU-DEFAULT',
            units: s.itemUnits || 1,
            sellingPrice: subtotal,
          }],
          payment: {
            mode: isCod ? 'COD' : 'PREPAID',
            collectableAmount: isCod ? Number(s.payment?.collectableAmount || s.amount || subtotal) : 0,
            subtotal,
          },
          status: 'READY_TO_SHIP',
          trackingTimeline: [{
            status: 'ORDER_CREATED',
            activity: 'Bulk order imported successfully',
            location: pickup.city,
            timestamp: new Date(),
          }],
        });
        createdList.push(created);
      } catch (err) {
        errors.push({ orderNumber: s.orderNumber || `Index ${i}`, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Successfully processed bulk batch: ${createdList.length} created, ${errors.length} failed.`,
      totalCreated: createdList.length,
      errors,
      shipments: createdList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
