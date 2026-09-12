const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderItem: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['damaged', 'wrong_product', 'defective', 'size_issue', 'not_as_expected', 'other'],
      required: true,
    },
    comment: { type: String },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'picked_up', 'verified', 'refunded'],
      default: 'requested',
    },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
