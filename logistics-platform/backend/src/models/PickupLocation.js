const mongoose = require('mongoose');

const pickupLocationSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    locationNickname: { type: String, required: true, trim: true }, // e.g. "Primary", "Home", "Delhi-Warehouse"
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    isPrimary: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupLocation', pickupLocationSchema);
