require('dotenv').config();
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const PickupLocation = require('../models/PickupLocation');
const Shipment = require('../models/Shipment');
const WalletTransaction = require('../models/WalletTransaction');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Seeding demo data...');

  // 1. Create or reset demo merchant
  let merchant = await Merchant.findOne({ email: 'demo@logixwave.com' });
  if (merchant) {
    await Merchant.deleteOne({ _id: merchant._id });
  }

  merchant = await Merchant.create({
    companyName: 'AMA YAAR Apparel Co.',
    email: 'demo@logixwave.com',
    password: 'Password@123',
    phone: '+919876543210',
    walletBalance: 2500, // ₹2500 initial testing credits
    kyc: {
      status: 'VERIFIED',
      gstin: '09AAACA1234A1Z5',
      pan: 'AAACA1234A',
      bankAccount: {
        accountName: 'AMA YAAR Retail LLP',
        accountNumber: '918097309680',
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
    },
  });

  console.log('Seeded demo merchant: demo@logixwave.com / Password@123');

  // 2. Create primary warehouse
  const warehouse = await PickupLocation.create({
    merchant: merchant._id,
    locationNickname: 'Primary Hub Lucknow',
    contactPerson: 'Vivek Singh',
    phone: '8932842907',
    email: 'amayaarofficial@gmail.com',
    addressLine1: 'E-1/818, Vinay Khand 1, Patrakarpuram',
    addressLine2: 'Near Ekta Park, Gomti Nagar',
    pincode: '226010',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    isPrimary: true,
  });

  merchant.defaultPickupLocation = warehouse._id;
  await merchant.save();

  // 3. Initial wallet recharge transaction
  await WalletTransaction.create({
    merchant: merchant._id,
    type: 'CREDIT_RECHARGE',
    amount: 2500,
    balanceBefore: 0,
    balanceAfter: 2500,
    description: 'Initial logistics operating credits',
    referenceId: 'PAY-WELCOME',
    status: 'SUCCESS',
  });

  // 4. Create sample shipments across different stages
  const samples = [
    {
      orderNumber: 'AY-901-DELHI',
      buyer: {
        name: 'Rahul Sharma',
        phone: '9811223344',
        email: 'rahul.sharma@gmail.com',
        addressLine1: 'B-44, Sector 62',
        addressLine2: 'Near Metro Station',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      payment: { mode: 'COD', collectableAmount: 1499, subtotal: 1499, freightCharge: 42, codCharge: 30, totalShippingCost: 72 },
      status: 'IN_TRANSIT',
      courier: {
        carrier: 'Delhivery Surface Express',
        courierId: 'delhivery_surface',
        rate: 72,
        etdDays: 2,
        awbNumber: 'DEL14389278912',
        pickupToken: 'PKP-DEL-89210',
      },
      trackingTimeline: [
        { status: 'ORDER_CREATED', activity: 'Manifest created on LogixWave', location: 'Lucknow', timestamp: new Date(Date.now() - 36 * 3600 * 1000) },
        { status: 'AWB_ASSIGNED', activity: 'AWB assigned via Delhivery Surface', location: 'Lucknow', timestamp: new Date(Date.now() - 30 * 3600 * 1000) },
        { status: 'PICKUP_SCHEDULED', activity: 'Pickup completed by agent', location: 'Lucknow Hub', timestamp: new Date(Date.now() - 20 * 3600 * 1000) },
        { status: 'IN_TRANSIT', activity: 'Arrived at regional sort center', location: 'Kanpur Sort Hub', timestamp: new Date(Date.now() - 8 * 3600 * 1000) },
      ],
    },
    {
      orderNumber: 'AY-902-MUMBAI',
      buyer: {
        name: 'Pooja Kulkarni',
        phone: '9820011223',
        email: 'pooja.k@gmail.com',
        addressLine1: 'Flat 402, Sea Green Apts',
        addressLine2: 'Linking Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
      payment: { mode: 'PREPAID', collectableAmount: 0, subtotal: 2199, freightCharge: 58, codCharge: 0, totalShippingCost: 58 },
      status: 'OUT_FOR_DELIVERY',
      courier: {
        carrier: 'Blue Dart Ground',
        courierId: 'bluedart_ground',
        rate: 58,
        etdDays: 2,
        awbNumber: 'BLU982314567',
        pickupToken: 'PKP-BLU-45120',
      },
      trackingTimeline: [
        { status: 'ORDER_CREATED', activity: 'Order placed', location: 'Lucknow', timestamp: new Date(Date.now() - 48 * 3600 * 1000) },
        { status: 'IN_TRANSIT', activity: 'Departed Mumbai Central Hub', location: 'Mumbai', timestamp: new Date(Date.now() - 5 * 3600 * 1000) },
        { status: 'OUT_FOR_DELIVERY', activity: 'Out for delivery with rider (Ajay - 9820055443)', location: 'Bandra Hub', timestamp: new Date(Date.now() - 1 * 3600 * 1000) },
      ],
    },
    {
      orderNumber: 'AY-903-BANGALORE',
      buyer: {
        name: 'Arjun Menon',
        phone: '9900112233',
        email: 'arjun.m@gmail.com',
        addressLine1: '12th Cross, Indiranagar',
        addressLine2: 'Near 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
      payment: { mode: 'COD', collectableAmount: 899, subtotal: 899, freightCharge: 46, codCharge: 28, totalShippingCost: 74 },
      status: 'NDR_FAILED',
      courier: {
        carrier: 'DTDC DotZot Priority',
        courierId: 'dtdc_express',
        rate: 74,
        etdDays: 3,
        awbNumber: 'DTD78291034',
        pickupToken: 'PKP-DTD-12903',
      },
      ndrDetails: {
        isNdr: true,
        lastNdrReason: 'Customer phone not reachable / Door locked',
        attemptsCount: 1,
        buyerAction: 'NONE',
        notes: 'Awaiting seller/buyer instruction for next attempt',
      },
      trackingTimeline: [
        { status: 'ORDER_CREATED', activity: 'Order created', location: 'Lucknow', timestamp: new Date(Date.now() - 72 * 3600 * 1000) },
        { status: 'IN_TRANSIT', activity: 'In transit to Bengaluru', location: 'Hyderabad Hub', timestamp: new Date(Date.now() - 24 * 3600 * 1000) },
        { status: 'NDR_FAILED', activity: 'Delivery Attempt Failed: Customer phone not reachable', location: 'Indiranagar Hub', timestamp: new Date(Date.now() - 2 * 3600 * 1000) },
      ],
    },
    {
      orderNumber: 'AY-904-KOLKATA',
      buyer: {
        name: 'Debashis Roy',
        phone: '9830112233',
        email: 'debashis.r@gmail.com',
        addressLine1: 'Block C, Salt Lake Sector 1',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700064',
      },
      payment: { mode: 'PREPAID', collectableAmount: 0, subtotal: 1299, freightCharge: 44, codCharge: 0, totalShippingCost: 44 },
      status: 'DELIVERED',
      courier: {
        carrier: 'Shadowfax Flash',
        courierId: 'shadowfax_surface',
        rate: 44,
        etdDays: 3,
        awbNumber: 'SFX67812901',
        pickupToken: 'PKP-SFX-77621',
      },
      trackingTimeline: [
        { status: 'DELIVERED', activity: 'Package delivered and signed by consignee', location: 'Salt Lake', timestamp: new Date(Date.now() - 10 * 3600 * 1000) },
      ],
    },
    {
      orderNumber: 'AY-905-NEW',
      buyer: {
        name: 'Sunita Verma',
        phone: '9450112233',
        email: 'sunita.v@gmail.com',
        addressLine1: 'House 88, Civil Lines',
        city: 'Prayagraj',
        state: 'Uttar Pradesh',
        pincode: '211001',
      },
      payment: { mode: 'COD', collectableAmount: 1899, subtotal: 1899, freightCharge: 0, codCharge: 0, totalShippingCost: 0 },
      status: 'READY_TO_SHIP',
      trackingTimeline: [
        { status: 'ORDER_CREATED', activity: 'New order waiting for courier selection', location: 'Lucknow', timestamp: new Date() },
      ],
    },
  ];

  for (const s of samples) {
    await Shipment.create({
      merchant: merchant._id,
      orderNumber: s.orderNumber,
      pickupLocation: warehouse._id,
      pickupAddressSnapshot: {
        locationNickname: warehouse.locationNickname,
        contactPerson: warehouse.contactPerson,
        phone: warehouse.phone,
        addressLine1: warehouse.addressLine1,
        addressLine2: warehouse.addressLine2,
        pincode: warehouse.pincode,
        city: warehouse.city,
        state: warehouse.state,
      },
      buyer: s.buyer,
      packageDetails: { length: 25, breadth: 20, height: 5, deadWeight: 0.6, volumetricWeight: 0.5, billableWeight: 0.6 },
      items: [{ name: 'Heavyweight Streetwear Oversized Tee', sku: 'AY-TEE-BLK', units: 1, sellingPrice: s.payment.subtotal }],
      payment: s.payment,
      courier: s.courier || {},
      status: s.status,
      ndrDetails: s.ndrDetails || {},
      trackingTimeline: s.trackingTimeline,
    });
  }
  console.log(`Seeded ${samples.length} realistic sample shipments.`);

  // 5. Seed Super Admin User
  let admin = await Merchant.findOne({ email: 'admin@logixwave.com' });
  if (admin) {
    await Merchant.deleteOne({ _id: admin._id });
  }

  admin = await Merchant.create({
    companyName: 'LogixWave Platform Headquarters',
    email: 'admin@logixwave.com',
    password: 'Admin@123',
    phone: '+919999900000',
    role: 'admin',
    walletBalance: 100000,
    kyc: { status: 'VERIFIED' },
  });
  console.log('Seeded Super Admin: admin@logixwave.com / Admin@123 (role: admin)');

  // 6. Seed Platform Settings
  const PlatformSettings = require('../models/PlatformSettings');
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    await PlatformSettings.create({
      carriers: {
        delhivery: { active: true, clientName: 'AMAYAAR_LOGISTICS', mode: 'sandbox' },
        bluedart: { active: true, customerCode: 'BD98231', mode: 'sandbox' },
        dtdc: { active: true, customerCode: 'DTDC1002', mode: 'sandbox' },
        shadowfax: { active: true, mode: 'sandbox' },
      },
      markupPercentage: 12,
      codPricing: { flatFee: 40, percentageFee: 2.0 },
      platformAnnouncement: 'LogixWave Multi-Carrier Network operational across 27,000+ Indian pincodes.',
    });
    console.log('Seeded Platform Settings with 12% markup and active carriers.');
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
