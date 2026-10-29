const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    shortDescription: { type: String },
    detailedDescription: { type: String },
    brand: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false, default: null },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
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
    keyFeatures: [{ type: String }],
    // Fabric & Product Details
    fabric: { type: String },
    gsm: { type: String },
    fit: { type: String },
    countryOfOrigin: { type: String },
    washCare: { type: String },
    whatsOnPrint: { type: String },
    stylingTip: { type: String },
    // Custom Exchange Policy
    exchangePolicy: { type: String },
    exchangeDays: { type: Number },
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
