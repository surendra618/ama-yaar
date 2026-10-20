const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },

    // 1. Delivery Charges Configuration
    deliveryCharge: { type: Number, default: 49, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 500, min: 0 },
    isFreeDeliveryEnabled: { type: Boolean, default: true },
    isDeliveryFeeActive: { type: Boolean, default: true },
    estimatedDeliveryDays: { type: String, default: '2-4 business days' },

    // 2. Exchange Policy & Charges Configuration
    exchangePolicyEnabled: { type: Boolean, default: true },
    exchangeDays: { type: Number, default: 7, min: 0 },
    exchangeCharge: { type: Number, default: 0, min: 0 },
    isExchangeFree: { type: Boolean, default: true },
    exchangePolicyText: {
      type: String,
      default:
        'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
    },
    returnPolicyText: {
      type: String,
      default:
        'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
    },

    // 3. Product Description & Details Specifications Defaults
    defaultFabric: { type: String, default: '100% Super Combed Terry Cotton' },
    defaultGsm: { type: String, default: '380 GSM Heavyweight Fabric' },
    defaultFit: { type: String, default: 'Oversized Streetwear Fit, Dropped Shoulder' },
    defaultCare: {
      type: String,
      default: 'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
    },
    defaultCountryOfOrigin: { type: String, default: 'India' },
    defaultStylingTip: {
      type: String,
      default:
        'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
    },
    defaultWhatsOnPrint: {
      type: String,
      default: 'High-density puff and screen print with reinforced twin needle stitching.',
    },

    // 4. Shiprocket Logistics Integration
    shiprocketEnabled: { type: Boolean, default: false },
    shiprocketEmail: { type: String, default: '' },
    shiprocketPassword: { type: String, default: '' },
    shiprocketPickupLocation: { type: String, default: 'Primary' },
    shiprocketSenderPincode: { type: String, default: '110001' },
    shiprocketAutoCreateOrder: { type: Boolean, default: false },
    shiprocketAutoGenerateAwb: { type: Boolean, default: false },
    defaultPackageWeight: { type: Number, default: 0.5, min: 0.05 },
    defaultPackageLength: { type: Number, default: 25, min: 1 },
    defaultPackageBreadth: { type: Number, default: 20, min: 1 },
    defaultPackageHeight: { type: Number, default: 5, min: 1 },
    shiprocketWebhookSecret: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
