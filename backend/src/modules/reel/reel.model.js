const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product2: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: String, default: '50% OFF' },
    views: { type: String, default: '15.2K views' },
    badge: { type: String, default: 'Top Selling' },
    poster: { type: String, required: true },
    altPoster: { type: String },
    video: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const reelSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    displayCount: { type: Number, default: 4 },
  },
  { timestamps: true }
);

const Reel = mongoose.model('Reel', reelSchema);
const ReelSetting = mongoose.model('ReelSetting', reelSettingSchema);

module.exports = { Reel, ReelSetting };
