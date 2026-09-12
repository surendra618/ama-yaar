const Order = require('../order/order.model');
const User = require('../user/user.model');
const Product = require('../product/product.model');
const ReturnRequest = require('../returnRequest/returnRequest.model');

async function getDashboardStats() {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    statusCounts,
    pendingReturns,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ReturnRequest.countDocuments({ status: 'requested' }),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6),
    Product.find({ isActive: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(5)
      .select('name slug price images rating numReviews stock'),
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Build status map
  const orderStatusMap = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };
  statusCounts.forEach((s) => {
    orderStatusMap[s._id] = s.count;
  });

  // Recent 7 days sales data for chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $nin: ['cancelled'] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const found = dailySales.find((s) => s._id === dateStr);
    chartData.push({
      date: dateStr,
      day: dayLabel,
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
    });
  }

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      pendingReturns,
      activeOrders: (orderStatusMap.placed || 0) + (orderStatusMap.confirmed || 0) + (orderStatusMap.processing || 0) + (orderStatusMap.shipped || 0),
    },
    orderStatusMap,
    chartData,
    recentOrders,
    topProducts,
  };
}

module.exports = { getDashboardStats };
