const Merchant = require('../models/Merchant');
const Shipment = require('../models/Shipment');
const WalletTransaction = require('../models/WalletTransaction');
const PlatformSettings = require('../models/PlatformSettings');
const Remittance = require('../models/Remittance');

// Helper to get or create platform settings
async function getOrCreateSettings() {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  return settings;
}

// 1. Platform Overview Metrics
exports.getOverview = async (req, res) => {
  try {
    const totalMerchants = await Merchant.countDocuments({ role: 'merchant' });
    const verifiedMerchants = await Merchant.countDocuments({ 'kyc.status': 'VERIFIED', role: 'merchant' });

    const totalShipments = await Shipment.countDocuments();
    const deliveredShipments = await Shipment.countDocuments({ status: 'DELIVERED' });
    const inTransitShipments = await Shipment.countDocuments({ status: { $in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] } });
    const ndrShipments = await Shipment.countDocuments({ status: 'NDR_FAILED' });

    const walletAggregation = await Merchant.aggregate([
      { $match: { role: 'merchant' } },
      { $group: { _id: null, totalBalance: { $sum: '$walletBalance' } } },
    ]);
    const totalWalletBalance = walletAggregation[0]?.totalBalance || 0;

    const codAggregation = await Shipment.aggregate([
      { $match: { 'payment.mode': 'COD', status: 'DELIVERED' } },
      { $group: { _id: null, totalCod: { $sum: '$payment.collectableAmount' } } },
    ]);
    const totalDeliveredCod = codAggregation[0]?.totalCod || 0;

    const recentShipments = await Shipment.find()
      .populate('merchant', 'companyName email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        merchants: { total: totalMerchants, verified: verifiedMerchants },
        shipments: {
          total: totalShipments,
          delivered: deliveredShipments,
          inTransit: inTransitShipments,
          ndr: ndrShipments,
        },
        financials: {
          totalWalletInCirculation: totalWalletBalance,
          totalDeliveredCod,
        },
        recentShipments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Merchants List
exports.getMerchants = async (req, res) => {
  try {
    const { search, kycStatus } = req.query;
    const query = { role: 'merchant' };

    if (kycStatus) {
      query['kyc.status'] = kycStatus;
    }
    if (search) {
      query.$or = [
        { companyName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const merchants = await Merchant.find(query).sort({ createdAt: -1 }).select('-password');

    // Attach shipment count to each merchant
    const merchantsWithStats = await Promise.all(
      merchants.map(async (m) => {
        const shipmentCount = await Shipment.countDocuments({ merchant: m._id });
        return {
          ...m.toObject(),
          totalShipments: shipmentCount,
        };
      })
    );

    res.json({ success: true, merchants: merchantsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Merchant KYC Status
exports.updateMerchantKyc = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['VERIFIED', 'PENDING', 'NOT_SUBMITTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid KYC status' });
    }

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { $set: { 'kyc.status': status } },
      { new: true }
    ).select('-password');

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    res.json({ success: true, message: `Merchant KYC updated to ${status}`, merchant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Manually Adjust Merchant Wallet (Credit/Debit)
exports.adjustMerchantWallet = async (req, res) => {
  try {
    const { amount, type, description } = req.body; // type: 'CREDIT' | 'DEBIT'
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid adjustment amount' });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    const balanceBefore = merchant.walletBalance;
    let balanceAfter = balanceBefore;

    if (type === 'CREDIT') {
      balanceAfter += numAmount;
    } else if (type === 'DEBIT') {
      if (balanceBefore < numAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient merchant balance for debit' });
      }
      balanceAfter -= numAmount;
    } else {
      return res.status(400).json({ success: false, message: 'Type must be CREDIT or DEBIT' });
    }

    merchant.walletBalance = balanceAfter;
    await merchant.save();

    await WalletTransaction.create({
      merchant: merchant._id,
      type: type === 'CREDIT' ? 'CREDIT_RECHARGE' : 'DEBIT_FREIGHT',
      amount: numAmount,
      balanceBefore,
      balanceAfter,
      description: description || `Admin Manual Adjustment (${type}): ₹${numAmount}`,
      status: 'SUCCESS',
      referenceId: 'ADMIN-' + Date.now(),
    });

    res.json({
      success: true,
      message: `Successfully adjusted wallet by ${type === 'CREDIT' ? '+' : '-'}₹${numAmount}`,
      walletBalance: balanceAfter,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Global Shipments Master
exports.getAllShipments = async (req, res) => {
  try {
    const { status, carrier, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (carrier) query['courier.carrier'] = carrier;
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'courier.awbNumber': new RegExp(search, 'i') },
        { 'buyer.name': new RegExp(search, 'i') },
        { 'buyer.phone': new RegExp(search, 'i') },
      ];
    }

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('merchant', 'companyName email phone')
      .populate('pickupLocation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      shipments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Platform Carrier Settings
exports.getCarrierSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCarrierSettings = async (req, res) => {
  try {
    const { carriers, markupPercentage, codPricing, platformAnnouncement, maintenanceMode } = req.body;
    const settings = await getOrCreateSettings();

    if (carriers) settings.carriers = { ...settings.carriers, ...carriers };
    if (markupPercentage !== undefined) settings.markupPercentage = markupPercentage;
    if (codPricing) settings.codPricing = { ...settings.codPricing, ...codPricing };
    if (platformAnnouncement !== undefined) settings.platformAnnouncement = platformAnnouncement;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();
    res.json({ success: true, message: 'Platform carrier & rate settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Remittances (Merchant COD Settlements)
exports.getRemittances = async (req, res) => {
  try {
    const remittances = await Remittance.find()
      .populate('merchant', 'companyName email phone kyc.bankAccount')
      .sort({ createdAt: -1 });

    res.json({ success: true, remittances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRemittance = async (req, res) => {
  try {
    const { merchantId, shipmentIds, utrNumber } = req.body;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    const shipments = await Shipment.find({
      _id: { $in: shipmentIds },
      merchant: merchant._id,
      'payment.mode': 'COD',
      status: 'DELIVERED',
    });

    if (shipments.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible delivered COD shipments found' });
    }

    const totalCod = shipments.reduce((sum, s) => sum + (s.payment.collectableAmount || 0), 0);
    const remittanceNumber = 'REM-' + Date.now();

    const remittance = await Remittance.create({
      remittanceNumber,
      merchant: merchant._id,
      shipments: shipments.map((s) => s._id),
      totalCodCollected: totalCod,
      netPayableAmount: totalCod,
      bankDetailsSnapshot: merchant.kyc?.bankAccount || {},
      utrNumber: utrNumber || 'UTR-MOCK-' + Math.floor(100000000 + Math.random() * 900000000),
      payoutStatus: utrNumber ? 'SETTLED' : 'PROCESSING',
      settlementDate: utrNumber ? new Date() : undefined,
    });

    res.json({
      success: true,
      message: `COD Remittance #${remittanceNumber} generated for ₹${totalCod}`,
      remittance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRemittanceStatus = async (req, res) => {
  try {
    const { payoutStatus, utrNumber } = req.body;
    const remittance = await Remittance.findById(req.params.id);
    if (!remittance) {
      return res.status(404).json({ success: false, message: 'Remittance not found' });
    }

    if (payoutStatus) remittance.payoutStatus = payoutStatus;
    if (utrNumber) remittance.utrNumber = utrNumber;
    if (payoutStatus === 'SETTLED') remittance.settlementDate = new Date();

    await remittance.save();
    res.json({ success: true, message: 'Remittance updated', remittance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
