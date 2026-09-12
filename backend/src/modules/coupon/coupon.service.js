const Coupon = require('./coupon.model');
const ApiError = require('../../utils/ApiError');

async function list(query = {}) {
  const { activeOnly, search } = query;
  const filter = {};

  if (activeOnly === 'true') {
    const now = new Date();
    filter.isActive = true;
    filter.startDate = { $lte: now };
    filter.expiryDate = { $gte: now };
  }

  if (search) {
    filter.code = { $regex: search, $options: 'i' };
  }

  return Coupon.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const doc = await Coupon.findById(id);
  if (!doc) throw new ApiError(404, 'Coupon not found');
  return doc;
}

async function validateCoupon({ code, cartTotal = 0 }) {
  if (!code) throw new ApiError(400, 'Coupon code is required');

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  const now = new Date();
  if (coupon.startDate > now || coupon.expiryDate < now) {
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit has been reached');
  }

  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(cartTotal, coupon.discountValue);
  }

  return {
    valid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderValue: coupon.minOrderValue,
    },
    discount: Math.round(discount),
  };
}

async function create(data) {
  data.code = data.code.toUpperCase().trim();
  const existing = await Coupon.findOne({ code: data.code });
  if (existing) throw new ApiError(409, 'Coupon with this code already exists');
  return Coupon.create(data);
}

async function update(id, data) {
  if (data.code) data.code = data.code.toUpperCase().trim();
  const doc = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Coupon not found');
  return doc;
}

async function remove(id) {
  const doc = await Coupon.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Coupon not found');
  return doc;
}

module.exports = { list, getById, validateCoupon, create, update, remove };
