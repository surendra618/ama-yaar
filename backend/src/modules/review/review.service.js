const Review = require('./review.model');
const Product = require('../product/product.model');
const Order = require('../order/order.model');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');

async function updateProductRating(productId) {
  if (!productId) return;
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
  const { product, user, page = 1, limit = 20 } = query;
  const filter = { isApproved: true };
  if (product) filter.product = product;
  if (user) filter.user = user;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(filter);
  const rawReviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const reviews = rawReviews.map((r) => ({
    ...r,
    authorName: r.user?.name || r.userName || 'Verified Buyer',
    authorAvatar: r.user?.avatar || null,
  }));

  return {
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
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
  const { productId, rating, comment, title, images, videos, userName, userEmail } = data;
  if (!productId || !rating) {
    throw new ApiError(400, 'Product ID and rating are required');
  }

  const numericRating = Math.max(1, Math.min(5, Number(rating)));
  const sanitizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const sanitizedVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];

  let hasPurchased = false;
  let resolvedName = userName || '';

  if (userId) {
    try {
      const userDoc = await User.findById(userId).select('name avatar email').lean();
      if (userDoc?.name) {
        resolvedName = userDoc.name;
      }
      hasPurchased = await Order.exists({
        user: userId,
        'items.product': productId,
        status: { $in: ['delivered', 'confirmed', 'shipped', 'out_for_delivery'] },
      });
    } catch (_) {}
  }

  if (!resolvedName) {
    resolvedName = 'Verified Buyer';
  }

  // Check if authenticated user already reviewed this product
  let review;
  if (userId) {
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      existing.rating = numericRating;
      if (title !== undefined) existing.title = title.trim();
      if (comment !== undefined) existing.comment = comment.trim();
      if (images !== undefined) existing.images = sanitizedImages;
      if (videos !== undefined) existing.videos = sanitizedVideos;
      if (hasPurchased) existing.isVerifiedPurchase = true;
      existing.userName = resolvedName;
      review = await existing.save();
    }
  }

  if (!review) {
    review = await Review.create({
      product: productId,
      user: userId || null,
      userName: resolvedName,
      userEmail: userEmail || undefined,
      rating: numericRating,
      title: title ? title.trim() : '',
      comment: comment ? comment.trim() : '',
      images: sanitizedImages,
      videos: sanitizedVideos,
      isVerifiedPurchase: Boolean(hasPurchased),
      isApproved: true,
    });
  }

  await updateProductRating(productId);
  return review;
}

async function update(id, userId, data) {
  const review = await Review.findOne({ _id: id, user: userId });
  if (!review) throw new ApiError(404, 'Review not found');

  if (data.rating) review.rating = Math.max(1, Math.min(5, Number(data.rating)));
  if (data.title !== undefined) review.title = data.title;
  if (data.comment !== undefined) review.comment = data.comment;
  if (data.images !== undefined) review.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  if (data.videos !== undefined) review.videos = Array.isArray(data.videos) ? data.videos.filter(Boolean) : [];

  await review.save();
  await updateProductRating(review.product);
  return review;
}

async function remove(id, user) {
  const query = { _id: id };
  if (user?.role !== 'admin') query.user = user?.id;

  const doc = await Review.findOneAndDelete(query);
  if (!doc) throw new ApiError(404, 'Review not found');
  await updateProductRating(doc.product);
  return doc;
}

async function listAdmin(query = {}) {
  const { page = 1, limit = 20, search, status } = query;
  const filter = {};
  if (status === 'approved') filter.isApproved = true;
  if (status === 'pending') filter.isApproved = false;

  if (search) {
    filter.$or = [
      { comment: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name email avatar')
    .populate('product', 'name images price slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  return {
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

async function toggleApproval(id) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found');
  review.isApproved = !review.isApproved;
  await review.save();
  await updateProductRating(review.product);
  return review;
}

module.exports = {
  list,
  getProductReviewStats,
  create,
  update,
  remove,
  listAdmin,
  toggleApproval,
  updateProductRating,
};
