const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./modules/user/user.model');
const Category = require('./modules/category/category.model');
const Product = require('./modules/product/product.model');
const Banner = require('./modules/banner/banner.model');
const CardSlider = require('./modules/cardSlider/cardSlider.model');
const Coupon = require('./modules/coupon/coupon.model');
const Address = require('./modules/address/address.model');
const Order = require('./modules/order/order.model');
const Review = require('./modules/review/review.model');
const Cart = require('./modules/cart/cart.model');
const Wishlist = require('./modules/wishlist/wishlist.model');
const Notification = require('./modules/notification/notification.model');
const Payment = require('./modules/payment/payment.model');
const ReturnRequest = require('./modules/returnRequest/returnRequest.model');
const Setting = require('./modules/setting/setting.model');
const { Creator, CreatorClick, CommissionTransaction, CreatorPayout } = require('./modules/creator/creator.model');
const env = require('./config/env');

async function seedCleanProdV3() {
  console.log('[prodv3-seed] Connecting to MongoDB URI:', env.mongoUri.replace(/\/\/([^:/@]+):([^@/]+)@/, '//$1:****@'));
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  console.log('[prodv3-seed] Connected! Target database:', mongoose.connection.name);

  if (!['prodv3', 'prod'].includes(mongoose.connection.name)) {
    throw new Error(`Safety check failed: connected to ${mongoose.connection.name}, expected prod or prodv3`);
  }

  // 1. Wipe all collections in prodv3
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
    CardSlider.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Notification.deleteMany({}),
    Payment.deleteMany({}),
    ReturnRequest.deleteMany({}),
    Setting.deleteMany({}),
    Creator.deleteMany({}),
    CreatorClick.deleteMany({}),
    CommissionTransaction.deleteMany({}),
    CreatorPayout.deleteMany({}),
  ]);
  console.log('[prodv3-seed] Cleaned all collections in prodv3.');

  // 2. Create Admin Account (ONLY Admin, NO demo/customer users)
  const passwordHash = await bcrypt.hash(env.adminSeed.password, 10);
  const admin = await User.create({
    name: 'AMA-YAAR Admin',
    email: env.adminSeed.email.toLowerCase(),
    password: passwordHash,
    role: 'admin',
    phone: '+91 9876543210',
    status: 'active',
  });
  console.log('[prodv3-seed] Created Admin Account:', admin.email);

  // 3. Create Standard Category Tree
  const catFashion = await Category.create({
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
    isActive: true,
  });

  const catElectronics = await Category.create({
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    isActive: true,
  });

  const catHome = await Category.create({
    name: 'Home & Living',
    slug: 'home-and-living',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    isActive: true,
  });

  const catBeauty = await Category.create({
    name: 'Beauty & Wellness',
    slug: 'beauty-and-wellness',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    isActive: true,
  });

  const catSports = await Category.create({
    name: 'Sports & Fitness',
    slug: 'sports-and-fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
    isActive: true,
  });

  const catWatches = await Category.create({
    name: 'Watches & Accessories',
    slug: 'watches-and-accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    isActive: true,
  });

  // Subcategories
  await Category.insertMany([
    { name: 'Men', slug: 'fashion-men', parent: catFashion._id, isActive: true },
    { name: 'Women', slug: 'fashion-women', parent: catFashion._id, isActive: true },
    { name: 'Footwear', slug: 'fashion-footwear', parent: catFashion._id, isActive: true },
    { name: 'Audio & Sound', slug: 'electronics-audio', parent: catElectronics._id, isActive: true },
    { name: 'Mobiles & Tablets', slug: 'electronics-mobiles', parent: catElectronics._id, isActive: true },
    { name: 'Laptops & Computers', slug: 'electronics-computers', parent: catElectronics._id, isActive: true },
    { name: 'Furniture', slug: 'home-furniture', parent: catHome._id, isActive: true },
    { name: 'Kitchen & Dining', slug: 'home-kitchen', parent: catHome._id, isActive: true },
    { name: 'Skincare', slug: 'beauty-skincare', parent: catBeauty._id, isActive: true },
    { name: 'Fragrances', slug: 'beauty-fragrances', parent: catBeauty._id, isActive: true },
    { name: 'Fitness Equipment', slug: 'sports-fitness', parent: catSports._id, isActive: true },
    { name: 'Sports Gear', slug: 'sports-gear', parent: catSports._id, isActive: true },
    { name: 'Smartwatches', slug: 'watches-smart', parent: catWatches._id, isActive: true },
    { name: 'Luxury Watches', slug: 'watches-luxury', parent: catWatches._id, isActive: true },
  ]);
  console.log('[prodv3-seed] Created Category Tree.');

  // 4. Hero & Promotional Banners
  await Banner.insertMany([
    {
      title: 'The Mega Festive Sale is Live',
      subtitle: 'Up to 60% Off on Top Electronics, Audio & Gadgets',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80',
      link: '/products?category=electronics',
      buttonText: 'Explore Gadgets',
      badge: 'Festive Special',
      position: 'home_hero',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Curated Autumn Collection 2026',
      subtitle: 'Refined menswear, elevated casuals & premium sneakers',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
      link: '/products?category=fashion',
      buttonText: 'Shop New Arrivals',
      badge: 'New Season',
      position: 'home_hero',
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'Elevate Your Sanctuary',
      subtitle: 'Modern Scandinavian furniture, artisanal cookware & home accents',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80',
      link: '/products?category=home-and-living',
      buttonText: 'Upgrade Home',
      badge: 'Interior Trends',
      position: 'home_hero',
      displayOrder: 3,
      isActive: true,
    },
    {
      title: 'Weekend Flash Offer: Flat ₹500 OFF',
      subtitle: 'Use code WELCOME50 on your first cart order above ₹999',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=80',
      link: '/products',
      buttonText: 'Claim Offer',
      badge: 'Limited Time',
      position: 'home_promo',
      displayOrder: 1,
      isActive: true,
    },
  ]);
  console.log('[prodv3-seed] Created Hero & Promo Banners.');

  // 5. Card Sliders
  await CardSlider.insertMany([
    {
      title: 'Men Collection',
      subtitle: 'Streetwear & Essentials',
      image: '/model01.png',
      link: '/products?category=men',
      badge: 'Popular',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Rain Jackets',
      subtitle: 'Weatherproof Essentials',
      image: '/model04.png',
      link: '/products?category=rain-jackets',
      badge: 'New Drop',
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'Formal Trousers',
      subtitle: 'Classic Tailored Fits',
      image: '/model03.png',
      link: '/products?category=formal-trousers',
      badge: 'Trending',
      displayOrder: 3,
      isActive: true,
    },
    {
      title: 'Graphic Tees',
      subtitle: 'Oversized Premium Cotton',
      image: '/model07.jpg',
      link: '/products?category=graphic-tees',
      badge: 'Hot Drop',
      displayOrder: 4,
      isActive: true,
    },
    {
      title: 'Outerwear',
      subtitle: 'Jackets & Hoodies',
      image: '/model05.jpg',
      link: '/products?category=outerwear',
      badge: 'Best Seller',
      displayOrder: 5,
      isActive: true,
    },
  ]);
  console.log('[prodv3-seed] Created Card Slider Items.');

  // 6. Discount Coupons
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 90);
  const prevMonth = new Date();
  prevMonth.setDate(prevMonth.getDate() - 1);

  await Coupon.insertMany([
    {
      code: 'WELCOME50',
      discountType: 'percentage',
      discountValue: 50,
      minOrderValue: 999,
      maxDiscount: 500,
      startDate: prevMonth,
      expiryDate: nextMonth,
      usageLimit: 1000,
      usedCount: 0,
      isActive: true,
    },
    {
      code: 'AMA20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 2000,
      maxDiscount: 1000,
      startDate: prevMonth,
      expiryDate: nextMonth,
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      discountType: 'freeDelivery',
      discountValue: 0,
      minOrderValue: 0,
      startDate: prevMonth,
      expiryDate: nextMonth,
      usageLimit: 2000,
      usedCount: 0,
      isActive: true,
    },
    {
      code: 'FESTIVE100',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 500,
      startDate: prevMonth,
      expiryDate: nextMonth,
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
    },
  ]);
  console.log('[prodv3-seed] Created Discount Coupons.');

  // 7. Store Settings (Delivery & Policies)
  await Setting.create({
    key: 'delivery',
    deliveryCharge: 49,
    freeDeliveryThreshold: 500,
    isFreeDeliveryEnabled: true,
    isDeliveryFeeActive: true,
    estimatedDeliveryDays: '2-4 business days',
    exchangePolicyEnabled: true,
    exchangeDays: 7,
    exchangeCharge: 0,
    isExchangeFree: true,
    exchangePolicyText:
      'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
    returnPolicyText:
      'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
    defaultFabric: '100% Super Combed Terry Cotton',
    defaultGsm: '380 GSM Heavyweight Fabric',
    defaultFit: 'Oversized Streetwear Fit, Dropped Shoulder',
    defaultCare:
      'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
    defaultCountryOfOrigin: 'India',
    defaultStylingTip:
      'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
    defaultWhatsOnPrint:
      'High-density puff and screen print with reinforced twin needle stitching.',
  });
  console.log('[prodv3-seed] Created Store Settings.');

  // 8. Verify collection counts
  const counts = {
    users_admin: await User.countDocuments({ role: 'admin' }),
    users_customer: await User.countDocuments({ role: 'customer' }),
    products: await Product.countDocuments(),
    categories: await Category.countDocuments(),
    banners: await Banner.countDocuments(),
    cardSliders: await CardSlider.countDocuments(),
    coupons: await Coupon.countDocuments(),
    orders: await Order.countDocuments(),
    payments: await Payment.countDocuments(),
    addresses: await Address.countDocuments(),
    reviews: await Review.countDocuments(),
    settings: await Setting.countDocuments(),
    creators: await Creator.countDocuments(),
  };

  console.log('[prodv3-seed] Final collection counts in prodv3:');
  console.table(counts);

  await mongoose.disconnect();
  console.log('[prodv3-seed] Done!');
}

seedCleanProdV3()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[prodv3-seed] Error:', err);
    process.exit(1);
  });
