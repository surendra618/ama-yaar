const mongoose = require('mongoose');

const remittanceSchema = new mongoose.Schema(
  {
    remittanceNumber: { type: String, required: true, unique: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }],
    totalCodCollected: { type: Number, required: true },
    freightDeducted: { type: Number, default: 0 },
    netPayableAmount: { type: Number, required: true },
    bankDetailsSnapshot: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    utrNumber: { type: String, default: '' },
    payoutStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SETTLED', 'FAILED'],
      default: 'PENDING',
    },
    settlementDate: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Remittance', remittanceSchema);
