const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    // Delivery charges configuration
    deliveryCharge: { type: Number, default: 49, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 500, min: 0 },
    isFreeDeliveryEnabled: { type: Boolean, default: true },
    isDeliveryFeeActive: { type: Boolean, default: true },
    estimatedDeliveryDays: { type: String, default: '2-4 business days' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
