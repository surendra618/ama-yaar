const mongoose = require('mongoose');

const manifestSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    manifestNumber: { type: String, required: true, unique: true },
    pickupLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupLocation', required: true },
    carrier: { type: String, required: true },
    shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }],
    totalShipments: { type: Number, required: true },
    totalWeight: { type: Number, required: true },
    pickupDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['OPEN', 'HANDED_OVER', 'CANCELLED'], default: 'HANDED_OVER' },
    pickupAgentName: { type: String, default: '' },
    pickupAgentPhone: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Manifest', manifestSchema);
