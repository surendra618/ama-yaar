const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    type: {
      type: String,
      enum: ['CREDIT_RECHARGE', 'DEBIT_FREIGHT', 'CREDIT_COD_REMITTANCE', 'DEBIT_RTO_CHARGE', 'CREDIT_REFUND'],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: { type: String, default: '' }, // Payment ID or AWB Number
    status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
