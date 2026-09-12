const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String },
        variant: { size: String, color: String },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
      addressType: { type: String, default: 'Home' },
    },
    paymentInfo: {
      provider: { type: String, enum: ['razorpay', 'cashfree', 'cod', 'card', 'upi', 'netbanking'], default: 'cod' },
      paymentId: { type: String },
      method: { type: String, default: 'Cash on Delivery' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    },
    status: {
      type: String,
      enum: [
        'placed',
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'placed',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
    subtotal: { type: Number, required: true },
    productDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    cancelReason: { type: String },
    estimatedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate human-friendly orderNumber if not present
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `AY-${Date.now().toString().slice(-4)}-${randomSuffix}`;
  }
  if (!this.estimatedDeliveryDate) {
    const est = new Date();
    est.setDate(est.getDate() + 4);
    this.estimatedDeliveryDate = est;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
