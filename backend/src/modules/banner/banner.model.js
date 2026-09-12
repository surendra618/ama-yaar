const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String, default: '/products' },
    buttonText: { type: String, default: 'Shop Now' },
    badge: { type: String },
    position: {
      type: String,
      enum: ['home_hero', 'home_promo', 'category', 'offer_strip'],
      default: 'home_hero',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
