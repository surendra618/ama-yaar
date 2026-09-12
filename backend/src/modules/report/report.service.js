const Order = require('../order/order.model');
const User = require('../user/user.model');
const Product = require('../product/product.model');
const Category = require('../category/category.model');

async function getSalesReport({ range = '30d' }) {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const salesTrend = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 },
        discounts: { $sum: { $add: ['$productDiscount', '$couponDiscount'] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$total' },
        totalDiscounts: { $sum: { $add: ['$productDiscount', '$couponDiscount'] } },
      },
    },
  ]);

  return {
    range,
    summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalDiscounts: 0 },
    trend: salesTrend,
  };
}

async function getRevenueReport({ range = '30d' }) {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const byPaymentMethod = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled'] } } },
    {
      $group: {
        _id: '$paymentInfo.provider',
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
  ]);

  const byStatus = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
  ]);

  return { byPaymentMethod, byStatus };
}

async function getProductPerformanceReport() {
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 10 },
  ]);

  const categoryStats = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        avgPrice: { $avg: '$price' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        categoryName: '$categoryInfo.name',
        productCount: 1,
        avgPrice: { $round: ['$avgPrice', 0] },
      },
    },
  ]);

  return { topProducts, categoryStats };
}

async function getUserGrowthReport({ range = '30d' }) {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const growth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { growth };
}

module.exports = {
  getSalesReport,
  getRevenueReport,
  getProductPerformanceReport,
  getUserGrowthReport,
};
