const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const merchantSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['merchant', 'admin'], default: 'merchant' },
    walletBalance: { type: Number, default: 500 }, // Welcome credit of ₹500 for testing
    kyc: {
      status: { type: String, enum: ['NOT_SUBMITTED', 'PENDING', 'VERIFIED'], default: 'VERIFIED' },
      gstin: { type: String, default: '' },
      pan: { type: String, default: '' },
      bankAccount: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifsc: { type: String, default: '' },
        bankName: { type: String, default: '' },
      },
    },
    apiKeys: {
      clientId: { type: String, unique: true },
      apiKey: { type: String, unique: true },
      webhookUrl: { type: String, default: '' },
    },
    defaultPickupLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupLocation' },
  },
  { timestamps: true }
);

merchantSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.apiKeys.clientId) {
    this.apiKeys.clientId = 'lxw_' + crypto.randomBytes(8).toString('hex');
    this.apiKeys.apiKey = 'sec_' + crypto.randomBytes(24).toString('hex');
  }
  next();
});

merchantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Merchant', merchantSchema);
