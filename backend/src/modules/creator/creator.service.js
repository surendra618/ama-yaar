const { Creator, CreatorClick, CommissionTransaction, CreatorPayout } = require('./creator.model');
const Coupon = require('../coupon/coupon.model');
const Order = require('../order/order.model');
const Product = require('../product/product.model');
const ApiError = require('../../utils/ApiError');
const { notifyAdmins } = require('../notification/adminNotifier');

function generateCreatorCode(name) {
  const cleanName = (name || 'CREATOR').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomSuffix}`;
}

async function applyCreator({ userId, payload }) {
  let existing = await Creator.findOne({ user: userId });
  if (existing) {
    if (existing.status === 'approved') {
      throw new ApiError(400, 'You are already an approved creator!');
    }
    // Update existing pending application
    Object.assign(existing, payload, { status: 'submitted' });
    await existing.save();
    return existing;
  }

  const creatorCode = generateCreatorCode(payload.name);
  const couponCode = `AY${creatorCode}`;

  const creator = await Creator.create({
    user: userId,
    creatorCode,
    couponCode,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    ageConfirmed: payload.ageConfirmed !== false,
    instagram: payload.instagram,
    youtube: payload.youtube,
    tiktok: payload.tiktok,
    otherSocial: payload.otherSocial,
    primaryPlatform: payload.primaryPlatform || 'Instagram',
    followerCount: Number(payload.followerCount) || 0,
    contentNiche: payload.contentNiche || 'Streetwear & Fashion',
    audienceLocation: payload.audienceLocation || 'India',
    portfolioUrl: payload.portfolioUrl,
    bio: payload.bio,
    bankDetails: payload.bankDetails || {},
  });

  // Notify Admins about new creator application
  notifyAdmins({
    event: 'newUser',
    subject: `New Creator Application: ${creator.name} (@${creator.instagram || creator.primaryPlatform})`,
    html: `
      <div style="font-family:sans-serif;padding:16px;">
        <h2>New Creator Application</h2>
        <p><strong>Name:</strong> ${creator.name}</p>
        <p><strong>Platform:</strong> ${creator.primaryPlatform} (${creator.followerCount.toLocaleString()} followers)</p>
        <p><strong>Email:</strong> ${creator.email} | <strong>Phone:</strong> ${creator.phone}</p>
        <p><strong>Handle:</strong> ${creator.instagram || creator.youtube || 'N/A'}</p>
      </div>
    `,
    text: `New Creator application from ${creator.name}`,
  }).catch(() => {});

  return creator;
}

async function getCreatorProfile(userId) {
  const creator = await Creator.findOne({ user: userId }).lean();
  return creator;
}

async function trackClick({ creatorCode, ip, userAgent, sourceUrl, targetUrl }) {
  if (!creatorCode) return null;
  const creator = await Creator.findOne({
    creatorCode: creatorCode.toUpperCase().trim(),
    status: 'approved',
  });
  if (!creator) return null;

  await CreatorClick.create({
    creator: creator._id,
    creatorCode: creator.creatorCode,
    ip,
    userAgent,
    sourceUrl,
    targetUrl,
  });

  await Creator.findByIdAndUpdate(creator._id, {
    $inc: { 'metrics.clicks': 1 },
  });

  return {
    creatorCode: creator.creatorCode,
    creatorName: creator.name,
    couponCode: creator.couponCode,
    discountRate: creator.customerDiscountRate,
  };
}

async function getCreatorDashboard(userId) {
  const creator = await Creator.findOne({ user: userId });
  if (!creator) {
    throw new ApiError(404, 'Creator profile not found.');
  }

  const transactions = await CommissionTransaction.find({ creator: creator._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const payouts = await CreatorPayout.find({ creator: creator._id })
    .sort({ createdAt: -1 })
    .lean();

  const conversionRate = creator.metrics.clicks > 0
    ? ((creator.metrics.orders / creator.metrics.clicks) * 100).toFixed(1)
    : '0.0';

  // Fetch top 12 trending products for promotional link creation
  const products = await Product.find({ isActive: true })
    .select('name slug price mrp images brand category')
    .limit(12)
    .lean();

  return {
    creator,
    stats: {
      clicks: creator.metrics.clicks || 0,
      orders: creator.metrics.orders || 0,
      sales: creator.metrics.sales || 0,
      commissionsEarned: creator.metrics.commissionsEarned || 0,
      conversionRate: `${conversionRate}%`,
    },
    wallet: creator.wallet,
    transactions,
    payouts,
    promoProducts: products,
  };
}

async function updateBankDetails(userId, bankDetails) {
  const creator = await Creator.findOneAndUpdate(
    { user: userId },
    { $set: { bankDetails } },
    { new: true }
  );
  if (!creator) throw new ApiError(404, 'Creator not found');
  return creator;
}

async function requestPayout(userId, amount) {
  const creator = await Creator.findOne({ user: userId });
  if (!creator) throw new ApiError(404, 'Creator not found');
  if (creator.status !== 'approved') throw new ApiError(403, 'Creator is not approved');

  const requestedAmount = Number(amount);
  if (!requestedAmount || requestedAmount < 500) {
    throw new ApiError(400, 'Minimum payout request amount is ₹500');
  }

  if (creator.wallet.available < requestedAmount) {
    throw new ApiError(400, `Insufficient available balance. You have ₹${creator.wallet.available} available.`);
  }

  if (!creator.bankDetails?.accountNumber && !creator.bankDetails?.upiId) {
    throw new ApiError(400, 'Please provide your bank account or UPI details before requesting a payout.');
  }

  // Deduct from available and add to pending review
  creator.wallet.available -= requestedAmount;
  await creator.save();

  const payout = await CreatorPayout.create({
    creator: creator._id,
    amount: requestedAmount,
    bankDetails: creator.bankDetails,
    status: 'requested',
  });

  notifyAdmins({
    event: 'newUser',
    subject: `Creator Payout Request: ₹${requestedAmount} by ${creator.name}`,
    html: `
      <div style="font-family:sans-serif;padding:16px;">
        <h3>Creator Payout Request</h3>
        <p><strong>Creator:</strong> ${creator.name} (${creator.creatorCode})</p>
        <p><strong>Amount:</strong> ₹${requestedAmount}</p>
        <p><strong>UPI / Bank:</strong> ${creator.bankDetails.upiId || creator.bankDetails.accountNumber}</p>
      </div>
    `,
    text: `Creator ${creator.name} requested payout of ₹${requestedAmount}`,
  }).catch(() => {});

  return payout;
}

// ----------------- ADMIN CONTROLS -----------------

async function listCreatorsAdmin(query = {}) {
  const { status, search, page = 1, limit = 20 } = query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { creatorCode: { $regex: search, $options: 'i' } },
      { couponCode: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Creator.countDocuments(filter);
  const creators = await Creator.find(filter)
    .populate('user', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return {
    creators,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

async function updateCreatorStatusAdmin(id, { status, rejectionReason, commissionRate, customerDiscountRate }) {
  const creator = await Creator.findById(id);
  if (!creator) throw new ApiError(404, 'Creator not found');

  creator.status = status || creator.status;
  if (rejectionReason !== undefined) creator.rejectionReason = rejectionReason;
  if (commissionRate !== undefined) creator.commissionRate = Number(commissionRate);
  if (customerDiscountRate !== undefined) creator.customerDiscountRate = Number(customerDiscountRate);

  // If approved, ensure coupon exists in store coupons
  if (status === 'approved') {
    const existingCoupon = await Coupon.findOne({ code: creator.couponCode });
    if (!existingCoupon) {
      const now = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(now.getFullYear() + 2);

      await Coupon.create({
        code: creator.couponCode,
        description: `Official creator discount code for ${creator.name}`,
        discountType: 'percentage',
        discountValue: creator.customerDiscountRate || 5,
        minOrderValue: 499,
        startDate: now,
        expiryDate: nextYear,
        isActive: true,
      }).catch((err) => console.warn('Creator coupon create notice:', err.message));
    }
  }

  await creator.save();
  return creator;
}

async function listPayoutsAdmin(query = {}) {
  const { status, page = 1, limit = 20 } = query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;

  const total = await CreatorPayout.countDocuments(filter);
  const payouts = await CreatorPayout.find(filter)
    .populate('creator', 'name email phone creatorCode wallet')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return {
    payouts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

async function processPayoutAdmin(payoutId, { status, paymentReference, adminNotes }) {
  const payout = await CreatorPayout.findById(payoutId);
  if (!payout) throw new ApiError(404, 'Payout not found');

  const creator = await Creator.findById(payout.creator);
  if (!creator) throw new ApiError(404, 'Associated creator not found');

  payout.status = status;
  if (paymentReference) payout.paymentReference = paymentReference;
  if (adminNotes) payout.adminNotes = adminNotes;

  if (status === 'paid') {
    payout.processedAt = new Date();
    creator.wallet.paid += payout.amount;
  } else if (status === 'rejected' || status === 'failed') {
    // Refund back to available balance
    creator.wallet.available += payout.amount;
  }

  await creator.save();
  await payout.save();

  return payout;
}

// ----------------- HOOK FOR ORDERS -----------------

async function attributeOrderCommission({ order, creatorCode, couponCode }) {
  try {
    if (!order || order.status === 'cancelled') return null;

    // Prevent duplicate commission attribution for the same order
    const existingTx = await CommissionTransaction.findOne({ order: order._id });
    if (existingTx) return existingTx;

    let creator = null;
    let attributionType = 'link';

    if (creatorCode) {
      creator = await Creator.findOne({
        creatorCode: String(creatorCode).toUpperCase().trim(),
        status: 'approved',
      });
    }

    if (!creator && couponCode) {
      creator = await Creator.findOne({
        couponCode: String(couponCode).toUpperCase().trim(),
        status: 'approved',
      });
      if (creator) attributionType = 'coupon';
    }

    if (!creator) return null;

    // Eligible order value is net subtotal (excluding shipping and taxes)
    const eligibleOrderValue = Math.max(0, (order.subtotal || 0) - (order.couponDiscount || 0));
    const rate = creator.commissionRate || 10;
    const commissionAmount = Math.round((eligibleOrderValue * rate) / 100);

    if (commissionAmount <= 0) return null;

    const isDelivered = order.status === 'delivered';
    const initialStatus = isDelivered ? 'available' : 'pending';

    // Record commission transaction (pending validation until delivery)
    const transaction = await CommissionTransaction.create({
      creator: creator._id,
      order: order._id,
      orderNumber: order.orderNumber,
      eligibleOrderValue,
      commissionRate: rate,
      commissionAmount,
      status: initialStatus,
      attributionType,
      notes: `Attributed from ${attributionType}: ${creatorCode || couponCode}`,
    });

    // Update Creator wallet and metrics
    if (isDelivered) {
      creator.wallet.available = (creator.wallet.available || 0) + commissionAmount;
    } else {
      creator.wallet.pending = (creator.wallet.pending || 0) + commissionAmount;
    }
    creator.metrics.orders += 1;
    creator.metrics.sales += eligibleOrderValue;
    creator.metrics.commissionsEarned += commissionAmount;

    await creator.save();
    return transaction;
  } catch (err) {
    console.error('[attributeOrderCommission] Error:', err.message);
    return null;
  }
}

async function confirmOrderCommission(orderId) {
  try {
    const transaction = await CommissionTransaction.findOne({
      order: orderId,
      status: 'pending',
    });
    if (!transaction) return null;

    const creator = await Creator.findById(transaction.creator);
    if (!creator) return null;

    const amount = transaction.commissionAmount || 0;
    creator.wallet.pending = Math.max(0, (creator.wallet.pending || 0) - amount);
    creator.wallet.available = (creator.wallet.available || 0) + amount;
    transaction.status = 'available';
    transaction.notes = `${transaction.notes || ''} | Validated upon delivery`.trim();

    await creator.save();
    await transaction.save();
    return transaction;
  } catch (err) {
    console.error('[confirmOrderCommission] Error:', err.message);
    return null;
  }
}

async function reverseOrderCommission(orderId, reason = 'Order cancelled or returned') {
  try {
    const transaction = await CommissionTransaction.findOne({
      order: orderId,
      status: { $in: ['pending', 'approved', 'available'] },
    });
    if (!transaction) return null;

    const creator = await Creator.findById(transaction.creator);
    if (!creator) return null;

    const amount = transaction.commissionAmount || 0;
    if (transaction.status === 'available') {
      creator.wallet.available = Math.max(0, (creator.wallet.available || 0) - amount);
    } else if (transaction.status === 'pending') {
      creator.wallet.pending = Math.max(0, (creator.wallet.pending || 0) - amount);
    } else if (transaction.status === 'approved') {
      creator.wallet.approved = Math.max(0, (creator.wallet.approved || 0) - amount);
    }

    creator.wallet.reversed = (creator.wallet.reversed || 0) + amount;
    creator.metrics.orders = Math.max(0, (creator.metrics.orders || 1) - 1);
    creator.metrics.sales = Math.max(0, (creator.metrics.sales || transaction.eligibleOrderValue) - transaction.eligibleOrderValue);
    creator.metrics.commissionsEarned = Math.max(0, (creator.metrics.commissionsEarned || amount) - amount);

    transaction.status = 'reversed';
    transaction.notes = `${transaction.notes || ''} | Reversed: ${reason}`.trim();

    await creator.save();
    await transaction.save();
    return transaction;
  } catch (err) {
    console.error('[reverseOrderCommission] Error:', err.message);
    return null;
  }
}

module.exports = {
  applyCreator,
  getCreatorProfile,
  trackClick,
  getCreatorDashboard,
  updateBankDetails,
  requestPayout,
  listCreatorsAdmin,
  updateCreatorStatusAdmin,
  listPayoutsAdmin,
  processPayoutAdmin,
  attributeOrderCommission,
  confirmOrderCommission,
  reverseOrderCommission,
};
