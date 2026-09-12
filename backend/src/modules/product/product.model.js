const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    brand: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [{ type: String }],
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 20 },
    variants: [
      {
        size: String,
        color: String,
        sku: String,
        stock: { type: Number, default: 10 },
        price: Number,
      },
    ],
    specifications: [
      {
        name: { type: String },
        value: { type: String },
      },
    ],
    highlights: [{ type: String }],
    tags: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-calculate discount if not set
productSchema.pre('save', function (next) {
  if (this.mrp && this.price && (!this.discount || this.discount === 0)) {
    this.discount = Math.max(0, Math.round(((this.mrp - this.price) / this.mrp) * 100));
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
