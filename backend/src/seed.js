const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./modules/user/user.model');
const Category = require('./modules/category/category.model');
const Product = require('./modules/product/product.model');
const Banner = require('./modules/banner/banner.model');
const Coupon = require('./modules/coupon/coupon.model');
const Address = require('./modules/address/address.model');
const Order = require('./modules/order/order.model');
const Review = require('./modules/review/review.model');
const Cart = require('./modules/cart/cart.model');
const Wishlist = require('./modules/wishlist/wishlist.model');
const Notification = require('./modules/notification/notification.model');

async function seedData() {
  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
    Coupon.deleteMany({}),
    Address.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[seed] Cleared old records...');

  // 1. Create Users
  const env = require('./config/env');
  const passwordHash = await bcrypt.hash(env.adminSeed.password, 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);

  const admin = await User.create({
    name: 'AMA-YAAR Admin',
    email: env.adminSeed.email.toLowerCase(),
    password: passwordHash,
    role: 'admin',
    phone: '+91 9876543210',
    status: 'active',
  });

  const demoUser = await User.create({
    name: 'Rahul Sharma',
    email: 'user@ama-yaar.com',
    password: userPasswordHash,
    role: 'customer',
    phone: '+91 9811223344',
    status: 'active',
  });

  console.log('[seed] Created admin and demo user...');

  // 2. Create Addresses for demo user
  const address1 = await Address.create({
    user: demoUser._id,
    fullName: 'Rahul Sharma',
    phone: '+91 9811223344',
    line1: 'Flat 402, Sunshine Heights, MG Road',
    line2: 'Near Central Mall',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    addressType: 'Home',
    isDefault: true,
  });

  const address2 = await Address.create({
    user: demoUser._id,
    fullName: 'Rahul Sharma (Office)',
    phone: '+91 9811223344',
    line1: 'Tech Park Tower B, 5th Floor, Outer Ring Rd',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    country: 'India',
    addressType: 'Work',
    isDefault: false,
  });

  await User.findByIdAndUpdate(demoUser._id, {
    addresses: [address1._id, address2._id],
  });

  // 3. Create Categories
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

  // Subcategories
  const subMen = await Category.create({ name: 'Men', slug: 'fashion-men', parent: catFashion._id });
  const subWomen = await Category.create({ name: 'Women', slug: 'fashion-women', parent: catFashion._id });
  const subFootwear = await Category.create({ name: 'Footwear', slug: 'fashion-footwear', parent: catFashion._id });

  const subAudio = await Category.create({ name: 'Audio & Sound', slug: 'electronics-audio', parent: catElectronics._id });
  const subMobiles = await Category.create({ name: 'Mobiles & Tablets', slug: 'electronics-mobiles', parent: catElectronics._id });
  const subComputers = await Category.create({ name: 'Laptops & Computers', slug: 'electronics-computers', parent: catElectronics._id });

  const subFurniture = await Category.create({ name: 'Furniture', slug: 'home-furniture', parent: catHome._id });
  const subKitchen = await Category.create({ name: 'Kitchen & Dining', slug: 'home-kitchen', parent: catHome._id });

  const subSkincare = await Category.create({ name: 'Skincare', slug: 'beauty-skincare', parent: catBeauty._id });
  const subFragrances = await Category.create({ name: 'Fragrances', slug: 'beauty-fragrances', parent: catBeauty._id });

  console.log('[seed] Created category tree...');

  // 4. Create Products
  const productsData = [
    {
      name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-noise-canceling-headphones',
      description: 'Industry-leading noise cancellation with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather. Up to 30-hour battery life with quick charging.',
      brand: 'Sony',
      category: catElectronics._id,
      subCategory: subAudio._id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
      ],
      price: 24990,
      mrp: 34990,
      discount: 29,
      stock: 35,
      rating: 4.8,
      numReviews: 124,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      variants: [
        { color: 'Silver', stock: 15, sku: 'SONY-XM5-SLV' },
        { color: 'Midnight Black', stock: 20, sku: 'SONY-XM5-BLK' },
      ],
      specifications: [
        { name: 'Driver Unit', value: '30 mm, Dome type' },
        { name: 'Battery Life', value: '30 hours (NC ON)' },
        { name: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm Aux' },
        { name: 'Weight', value: '250g' },
      ],
      highlights: ['Industry-Leading Active Noise Cancellation', 'Crystal Clear Hands-Free Calling', 'Multipoint Connection (2 Devices)', 'Ultra-Fast Quick Charge'],
      tags: ['audio', 'headphones', 'sony', 'wireless', 'anc'],
    },
    {
      name: 'Apple MacBook Air M3 Chip 15-inch Liquid Retina Display',
      slug: 'apple-macbook-air-m3-15-inch',
      description: 'Supercharged by the next-generation M3 chip, the redesigned MacBook Air 15 combines incredible performance and up to 18 hours of battery life in a strikingly thin aluminum enclosure.',
      brand: 'Apple',
      category: catElectronics._id,
      subCategory: subComputers._id,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
      ],
      price: 134900,
      mrp: 144900,
      discount: 7,
      stock: 12,
      rating: 4.9,
      numReviews: 89,
      isFeatured: true,
      isTrending: true,
      variants: [
        { color: 'Space Grey', size: '512GB SSD / 16GB RAM', stock: 6, sku: 'MBA-M3-15-SG' },
        { color: 'Midnight Blue', size: '512GB SSD / 16GB RAM', stock: 6, sku: 'MBA-M3-15-MID' },
      ],
      specifications: [
        { name: 'Processor', value: 'Apple M3 chip (8-core CPU / 10-core GPU)' },
        { name: 'Memory', value: '16GB Unified Memory' },
        { name: 'Storage', value: '512GB NVMe SSD' },
        { name: 'Display', value: '15.3-inch Liquid Retina (2880 x 1864)' },
      ],
      highlights: ['Next-Gen M3 Processor', '18 Hours Battery Life', '1080p FaceTime HD Camera', 'MagSafe 3 Charging'],
      tags: ['apple', 'macbook', 'laptop', 'm3', 'premium'],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G AI Smartphone',
      slug: 'samsung-galaxy-s24-ultra-5g',
      description: 'Meet Galaxy S24 Ultra with Galaxy AI, titanium frame, 200MP camera system with ProVisual engine, and built-in S Pen.',
      brand: 'Samsung',
      category: catElectronics._id,
      subCategory: subMobiles._id,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
      ],
      price: 119999,
      mrp: 134999,
      discount: 11,
      stock: 20,
      rating: 4.7,
      numReviews: 64,
      isFeatured: true,
      variants: [
        { color: 'Titanium Gray', size: '256GB', stock: 10, sku: 'S24U-TGR-256' },
        { color: 'Titanium Black', size: '512GB', stock: 10, sku: 'S24U-TBK-512' },
      ],
      specifications: [
        { name: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
        { name: 'Primary Camera', value: '200MP + 50MP + 12MP + 10MP' },
        { name: 'Battery', value: '5000 mAh with 45W Fast Charging' },
      ],
      highlights: ['Galaxy AI Built-in', 'Titanium Shield Armor', '200MP Ultra Pro Camera', 'Built-in S Pen Stylus'],
      tags: ['samsung', 'smartphone', '5g', 'galaxy'],
    },
    {
      name: 'Nike Air Max 270 React Running Shoes',
      slug: 'nike-air-max-270-react-running-shoes',
      description: 'The Nike Air Max 270 React merges artistic design with cutting-edge comfort. Features a lightweight Nike React foam midsole and oversized 270 Max Air unit in the heel.',
      brand: 'Nike',
      category: catFashion._id,
      subCategory: subFootwear._id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
      ],
      price: 6995,
      mrp: 10995,
      discount: 36,
      stock: 40,
      rating: 4.6,
      numReviews: 210,
      isBestSeller: true,
      isTrending: true,
      variants: [
        { size: 'UK 7', color: 'Crimson Red / White', stock: 10, sku: 'NKE-AM270-07' },
        { size: 'UK 8', color: 'Crimson Red / White', stock: 15, sku: 'NKE-AM270-08' },
        { size: 'UK 9', color: 'Crimson Red / White', stock: 15, sku: 'NKE-AM270-09' },
      ],
      specifications: [
        { name: 'Material', value: 'Breathable Mesh & Synthetic' },
        { name: 'Sole', value: 'React Foam + Max Air Heel' },
        { name: 'Closure', value: 'Speed Lacing System' },
      ],
      highlights: ['Max Air 270 Heel Cushioning', 'Ultra-lightweight React Foam', 'Durable Rubber Outsole'],
      tags: ['nike', 'shoes', 'running', 'sneakers', 'fashion'],
    },
    {
      name: 'Premium Oxford Slim-Fit Cotton Shirt',
      slug: 'premium-oxford-slim-fit-cotton-shirt',
      description: 'Crafted from 100% long-staple Egyptian cotton, this crisp button-down Oxford shirt offers enduring elegance, breathability, and seamless wrinkle resistance for the modern gentleman.',
      brand: 'Raymond',
      category: catFashion._id,
      subCategory: subMen._id,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      ],
      price: 1899,
      mrp: 3299,
      discount: 42,
      stock: 60,
      rating: 4.5,
      numReviews: 78,
      isNewArrival: true,
      variants: [
        { size: 'M', color: 'Classic Sky Blue', stock: 20, sku: 'SHIRT-M-BLU' },
        { size: 'L', color: 'Classic Sky Blue', stock: 25, sku: 'SHIRT-L-BLU' },
        { size: 'XL', color: 'Classic Sky Blue', stock: 15, sku: 'SHIRT-XL-BLU' },
      ],
      specifications: [
        { name: 'Fabric', value: '100% Combed Pure Cotton' },
        { name: 'Fit', value: 'Tailored Slim Fit' },
        { name: 'Collar', value: 'Button-Down Oxford Collar' },
      ],
      highlights: ['100% Pure Egyptian Cotton', 'Wrinkle-Resistant Weave', 'Mother-of-Pearl Finish Buttons'],
      tags: ['men', 'shirt', 'cotton', 'formal', 'fashion'],
    },
    {
      name: 'Minimalist Scandinavian Solid Teak Wood Lounge Chair',
      slug: 'minimalist-scandinavian-solid-teak-lounge-chair',
      description: 'Hand-finished solid teak wood chair with high-density ergonomic foam cushioning and neutral linen upholstery. A stunning accent piece for living spaces and studies.',
      brand: 'UrbanLiving',
      category: catHome._id,
      subCategory: subFurniture._id,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      ],
      price: 14499,
      mrp: 22999,
      discount: 37,
      stock: 15,
      rating: 4.9,
      numReviews: 32,
      isFeatured: true,
      variants: [
        { color: 'Natural Walnut & Beige', stock: 8, sku: 'CHR-WAL-BGE' },
        { color: 'Teak & Charcoal Grey', stock: 7, sku: 'CHR-TEK-GRY' },
      ],
      specifications: [
        { name: 'Material', value: 'Grade-A Seasoned Teak Wood' },
        { name: 'Fabric', value: 'Water-Repellent Breathable Linen' },
        { name: 'Dimensions', value: '78cm x 72cm x 82cm' },
      ],
      highlights: ['100% Solid Seasoned Wood Frame', 'Ergonomic Curved Backrest', 'Anti-Scratch Floor Protectors'],
      tags: ['furniture', 'chair', 'decor', 'scandinavian', 'home'],
    },
    {
      name: 'Cast Iron Dutch Oven 5.5 Quart Enamelled Pot',
      slug: 'cast-iron-dutch-oven-5-5-quart',
      description: 'Heavy-duty enameled cast iron delivers superior heat distribution and retention for slow cooking, braising, baking artisan sourdough breads, and stews.',
      brand: 'ChefCraft',
      category: catHome._id,
      subCategory: subKitchen._id,
      images: [
        'https://images.unsplash.com/photo-1584990347449-34b8c9fb605e?w=800&q=80',
        'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&q=80',
      ],
      price: 3999,
      mrp: 6499,
      discount: 38,
      stock: 25,
      rating: 4.8,
      numReviews: 45,
      isTrending: true,
      variants: [
        { color: 'Ceramic Cherry Red', stock: 15, sku: 'DUTCH-RED-55' },
        { color: 'Cobalt Navy Blue', stock: 10, sku: 'DUTCH-BLU-55' },
      ],
      specifications: [
        { name: 'Capacity', value: '5.5 Quarts (5.2 Litres)' },
        { name: 'Heat Tolerance', value: 'Up to 260°C / 500°F (Oven Safe)' },
        { name: 'Coating', value: 'Multi-Layer Glass Enamel' },
      ],
      highlights: ['Even Heat Distribution & Retention', 'Oven Safe Up to 500°F', 'Compatible with Induction & Gas'],
      tags: ['kitchen', 'cookware', 'cast-iron', 'dutch-oven'],
    },
    {
      name: 'Luxury Botanical Radiance Face Serum (Vitamin C + Hyaluronic)',
      slug: 'luxury-botanical-radiance-face-serum',
      description: 'Potent 15% Vitamin C combined with botanical hyaluronic acid and ferulic acid to brighten dark spots, even skin tone, and deeply hydrate without grease.',
      brand: 'AuraBotanics',
      category: catBeauty._id,
      subCategory: subSkincare._id,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
        'https://images.unsplash.com/photo-1608248597359-0524458f44ff?w=800&q=80',
      ],
      price: 1249,
      mrp: 2499,
      discount: 50,
      stock: 80,
      rating: 4.7,
      numReviews: 142,
      isBestSeller: true,
      isNewArrival: true,
      variants: [
        { size: '30ml Dropper', stock: 50, sku: 'SRM-30ML' },
        { size: '50ml Value Pack', stock: 30, sku: 'SRM-50ML' },
      ],
      specifications: [
        { name: 'Skin Type', value: 'All Skin Types (Dermatologist Tested)' },
        { name: 'Key Ingredients', value: '15% Ethyl Ascorbic Acid, 2% Hyaluronic Acid' },
        { name: 'Formulation', value: '100% Vegan, Cruelty-Free, Paraben-Free' },
      ],
      highlights: ['Visibly Brightens Skin in 14 Days', '24-Hour Deep Hydration Lock', '100% Clean Organic Formulation'],
      tags: ['skincare', 'serum', 'beauty', 'vitamin-c', 'radiance'],
    },
  ];

  const createdProducts = await Product.insertMany(productsData);
  console.log(`[seed] Created ${createdProducts.length} rich catalog products...`);

  // 5. Create Hero & Promo Banners
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

  console.log('[seed] Created promotional banners...');

  // 6. Create Coupons
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 45);
  const prevMonth = new Date();
  prevMonth.setDate(prevMonth.getDate() - 10);

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
      usedCount: 14,
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
      usedCount: 28,
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
      usedCount: 42,
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
      usedCount: 5,
      isActive: true,
    },
  ]);

  console.log('[seed] Created discount coupons...');

  // 7. Create Sample Reviews
  const pSony = createdProducts[0];
  const pNike = createdProducts[3];

  await Review.insertMany([
    {
      product: pSony._id,
      user: demoUser._id,
      rating: 5,
      comment: 'Absolutely phenomenal sound signature and the noise cancellation is unmatched. Battery easily lasts days!',
      isVerifiedPurchase: true,
      isApproved: true,
    },
    {
      product: pNike._id,
      user: demoUser._id,
      rating: 5,
      comment: 'Super comfortable for all-day walking and daily jogging. Great cushion in the heel.',
      isVerifiedPurchase: true,
      isApproved: true,
    },
  ]);

  // 8. Create Sample Order for Demo User
  const sampleOrder = await Order.create({
    orderNumber: `AY-${Date.now().toString().slice(-4)}-104829`,
    user: demoUser._id,
    items: [
      {
        product: pSony._id,
        name: pSony.name,
        image: pSony.images[0],
        variant: { color: 'Midnight Black' },
        quantity: 1,
        price: pSony.price,
      },
      {
        product: pNike._id,
        name: pNike.name,
        image: pNike.images[0],
        variant: { size: 'UK 8', color: 'Crimson Red' },
        quantity: 1,
        price: pNike.price,
      },
    ],
    shippingAddress: {
      fullName: 'Rahul Sharma',
      phone: '+91 9811223344',
      line1: 'Flat 402, Sunshine Heights, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      addressType: 'Home',
    },
    paymentInfo: {
      provider: 'card',
      paymentId: 'PAY-SAMPLE-9921',
      method: 'Credit Card',
      status: 'paid',
    },
    status: 'shipped',
    statusHistory: [
      { status: 'placed', note: 'Order placed by customer', at: new Date(Date.now() - 36 * 3600 * 1000) },
      { status: 'confirmed', note: 'Payment verified successfully', at: new Date(Date.now() - 35 * 3600 * 1000) },
      { status: 'processing', note: 'Item packaged in warehouse', at: new Date(Date.now() - 20 * 3600 * 1000) },
      { status: 'shipped', note: 'Handed over to BlueDart Courier (AWB: BLU882910)', at: new Date(Date.now() - 6 * 3600 * 1000) },
    ],
    subtotal: pSony.price + pNike.price,
    productDiscount: (pSony.mrp - pSony.price) + (pNike.mrp - pNike.price),
    couponDiscount: 500,
    couponCode: 'WELCOME50',
    deliveryCharge: 0,
    tax: Math.round((pSony.price + pNike.price) * 0.05),
    total: Math.round(pSony.price + pNike.price - 500 + (pSony.price + pNike.price) * 0.05),
  });

  // 9. Create Notifications
  await Notification.create({
    user: demoUser._id,
    type: 'order',
    title: 'Order Dispatched!',
    message: `Your order #${sampleOrder.orderNumber} is now on its way via BlueDart Express.`,
    isRead: false,
  });

  console.log('[seed] Seeding complete!');
  return { success: true };
}

// Standalone execution
if (require.main === module) {
  const env = require('./config/env');
  mongoose
    .connect(env.mongoUri)
    .then(async () => {
      console.log('[seed] Connected to MongoDB for manual seed');
      await seedData();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed] Manual seed error:', err.message);
      process.exit(1);
    });
}

module.exports = { seedData };
