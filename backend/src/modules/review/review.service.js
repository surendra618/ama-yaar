const Review = require('./review.model');
const Product = require('../product/product.model');
const Order = require('../order/order.model');
const ApiError = require('../../utils/ApiError');

async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const count = reviews.length;
  if (count === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    return;
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  await Product.findByIdAndUpdate(productId, {
    rating: Number(avg.toFixed(1)),
    numReviews: count,
  });
}

async function list(query = {}) {
  const { product, user, page = 1, limit = 10 } = query;
  const filter = { isApproved: true };
  if (product) filter.product = product;
  if (user) filter.user = user;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getProductReviewStats(productId) {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const total = reviews.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    sum += r.rating;
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });

  const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

  return {
    total,
    average,
    distribution: {
      5: counts[5],
      4: counts[4],
      3: counts[3],
      2: counts[2],
      1: counts[1],
    },
  };
}

async function create(userId, data) {
  const { productId, rating, comment, images } = data;
  if (!productId || !rating) {
    throw new ApiError(400, 'Product ID and rating are required');
  }

  // Check if verified purchase
  const hasPurchased = await Order.exists({
    user: userId,
    'items.product': productId,
    status: { $in: ['delivered', 'confirmed', 'shipped', 'out_for_delivery'] },
  });

  // Check if user already reviewed
  const existing = await Review.findOne({ product: productId, user: userId });
  let review;
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    if (images) existing.images = images;
    review = await existing.save();
  } else {
    review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased,
    });
  }

  await updateProductRating(productId);
  return review;
}

async function update(id, userId, data) {
  const review = await Review.findOne({ _id: id, user: userId });
  if (!review) throw new ApiError(404, 'Review not found');

  if (data.rating) review.rating = data.rating;
  if (data.comment !== undefined) review.comment = data.comment;
  if (data.images) review.images = data.images;

  await review.save();
  await updateProductRating(review.product);
  return review;
}

async function remove(id, user) {
  const query = { _id: id };
  if (user.role !== 'admin') query.user = user.id;

  const doc = await Review.findOneAndDelete(query);
  if (!doc) throw new ApiError(404, 'Review not found');
  await updateProductRating(doc.product);
  return doc;
}

module.exports = { list, getProductReviewStats, create, update, remove };
