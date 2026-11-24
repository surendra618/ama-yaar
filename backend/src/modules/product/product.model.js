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
    sku: { type: String, trim: true, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 20 },
    variants: [
      {
        size: String,
        color: String,
        sku: { type: String, trim: true, default: '' },
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
    modelInfo: { type: String },
    bulletFeatures: [{ type: String }],
    // Size Chart & Fit Guide
    sizeChartType: { type: String, default: 'default' }, // 'default' | 'tops' | 'bottoms' | 'image' | 'custom'
    sizeChartImage: { type: String, default: '' },
    sizeChartPdf: { type: String, default: '' },
    customSizeChart: [
      {
        size: String,
        chest: String,
        length: String,
        shoulder: String,
        sleeve: String,
        waist: String,
        hip: String,
        inseam: String,
      },
    ],
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

// Auto-calculate discount and SKU if not set
productSchema.pre('save', function (next) {
  if (this.mrp && this.price && (!this.discount || this.discount === 0)) {
    this.discount = Math.max(0, Math.round(((this.mrp - this.price) / this.mrp) * 100));
  }

  // Auto-generate unique product SKU if missing
  if (!this.sku && this.name) {
    const brandPrefix = (this.brand || 'AY').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'AY';
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.sku = `${brandPrefix}-${rand}`;
  }

  // Ensure variants inherit or have SKU
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((v) => {
      if (!v.sku && this.sku) {
        v.sku = `${this.sku}-${v.size || 'STD'}`.toUpperCase();
      }
    });
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
