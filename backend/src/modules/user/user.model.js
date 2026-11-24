const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String },
    googleId: { type: String },
    fcmTokens: [{ type: String }],
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    isSuperAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'blocked', 'inactive'], default: 'active' },
    welcomeEmailSent: { type: Boolean, default: false },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
