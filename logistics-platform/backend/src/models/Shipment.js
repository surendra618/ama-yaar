const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    orderNumber: { type: String, required: true },
    channel: { type: String, default: 'Custom / API' },

    pickupLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupLocation',
      required: true,
    },
    pickupAddressSnapshot: {
      locationNickname: String,
      contactPerson: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      pincode: String,
      city: String,
      state: String,
    },

    buyer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    packageDetails: {
      length: { type: Number, default: 20 }, // cm
      breadth: { type: Number, default: 15 }, // cm
      height: { type: Number, default: 5 }, // cm
      deadWeight: { type: Number, required: true, default: 0.5 }, // kg
      volumetricWeight: { type: Number, default: 0.3 }, // kg
      billableWeight: { type: Number, default: 0.5 }, // kg
    },

    items: [
      {
        name: { type: String, required: true },
        sku: { type: String, default: 'SKU-ITEM' },
        units: { type: Number, default: 1 },
        sellingPrice: { type: Number, default: 0 },
        hsn: { type: String, default: '61091000' },
      },
    ],

    payment: {
      mode: { type: String, enum: ['PREPAID', 'COD'], required: true },
      collectableAmount: { type: Number, default: 0 },
      subtotal: { type: Number, required: true },
      freightCharge: { type: Number, default: 0 },
      codCharge: { type: Number, default: 0 },
      totalShippingCost: { type: Number, default: 0 },
    },

    courier: {
      carrier: { type: String, default: '' }, // 'Delhivery' | 'Blue Dart' | 'DTDC' | 'Shadowfax'
      courierId: { type: String, default: '' },
      rate: { type: Number, default: 0 },
      etdDays: { type: Number, default: 3 },
      awbNumber: { type: String, default: '' },
      pickupToken: { type: String, default: '' },
      pickupDate: { type: Date },
    },

    status: {
      type: String,
      enum: [
        'DRAFT',
        'READY_TO_SHIP',
        'AWB_ASSIGNED',
        'PICKUP_SCHEDULED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'NDR_FAILED',
        'RTO_INITIATED',
        'RTO_DELIVERED',
        'CANCELLED',
      ],
      default: 'READY_TO_SHIP',
    },

    ndrDetails: {
      isNdr: { type: Boolean, default: false },
      lastNdrReason: { type: String, default: '' },
      attemptsCount: { type: Number, default: 0 },
      buyerAction: { type: String, enum: ['NONE', 'RE_ATTEMPT', 'UPDATE_ADDRESS', 'RTO'], default: 'NONE' },
      notes: { type: String, default: '' },
    },

    trackingTimeline: [
      {
        status: { type: String, required: true },
        activity: { type: String, required: true },
        location: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    manifestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manifest' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
