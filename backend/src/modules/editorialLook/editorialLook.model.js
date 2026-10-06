const mongoose = require('mongoose');

const editorialLookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    tag: { type: String, default: 'STREETWEAR' },
    season: { type: String, default: '2026 EDITION' },
    drop: { type: String, default: 'EXCLUSIVE' },
    status: { type: String, default: 'IN STOCK' },
    category1: { type: String, default: 'HOODIE' },
    category2: { type: String, default: 'SNEAKER' },
    image: { type: String, required: true },
    fallback: { type: String, default: '/boyse.png' },
    gradient: { type: String, default: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]' },
    isCutout: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditorialLook', editorialLookSchema);
