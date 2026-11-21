const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    creatorCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'suspended'],
      default: 'submitted',
    },
    // Application & Profile details
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    ageConfirmed: { type: Boolean, default: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    otherSocial: { type: String, trim: true },
    primaryPlatform: { type: String, default: 'Instagram' },
    followerCount: { type: Number, default: 0 },
    contentNiche: { type: String, default: 'Streetwear & Fashion' },
    audienceLocation: { type: String, default: 'India' },
    portfolioUrl: { type: String, trim: true },
    bio: { type: String },
    rejectionReason: { type: String },

    // Commission rules
    commissionRate: { type: Number, default: 10 }, // percentage, e.g. 10%
    customerDiscountRate: { type: Number, default: 5 }, // discount given to their buyers, e.g. 5%

    // Financial & Wallet
    wallet: {
      pending: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      reversed: { type: Number, default: 0 },
    },

    // Bank Details for payout
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },

    // Aggregated Metrics
    metrics: {
      clicks: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      commissionsEarned: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Click tracking model
const creatorClickSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    creatorCode: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    sourceUrl: { type: String },
    targetUrl: { type: String },
  },
  { timestamps: true }
);

// Ledger of commission transactions
const commissionTransactionSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String },
    eligibleOrderValue: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'available', 'paid', 'reversed'],
      default: 'pending',
    },
    attributionType: { type: String, enum: ['link', 'coupon'], default: 'link' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Payout request model
const creatorPayoutSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    amount: { type: Number, required: true, min: 500 },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
    status: {
      type: String,
      enum: ['requested', 'under_review', 'approved', 'processing', 'paid', 'failed', 'rejected'],
      default: 'requested',
    },
    adminNotes: { type: String },
    paymentReference: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const Creator = mongoose.model('Creator', creatorSchema);
const CreatorClick = mongoose.model('CreatorClick', creatorClickSchema);
const CommissionTransaction = mongoose.model('CommissionTransaction', commissionTransactionSchema);
const CreatorPayout = mongoose.model('CreatorPayout', creatorPayoutSchema);

module.exports = {
  Creator,
  CreatorClick,
  CommissionTransaction,
  CreatorPayout,
};
