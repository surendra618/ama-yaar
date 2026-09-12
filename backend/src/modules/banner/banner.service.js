const Banner = require('./banner.model');
const ApiError = require('../../utils/ApiError');

const fallbackBanners = [
  {
    _id: 'banner_f1',
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
    _id: 'banner_f2',
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
    _id: 'banner_f3',
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
];

async function list(query = {}) {
  try {
    const { position, activeOnly = 'false' } = query;
    const filter = {};

    if (activeOnly === 'true') {
      filter.isActive = true;
      const now = new Date();
      filter.$or = [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ];
    }

    if (position) filter.position = position;

    return await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  } catch (err) {
    console.warn('[banner.service] Database query failed, returning fallback list:', err.message);
    return fallbackBanners;
  }
}

async function getById(id) {
  try {
    const doc = await Banner.findById(id);
    if (!doc) return fallbackBanners[0];
    return doc;
  } catch (err) {
    return fallbackBanners[0];
  }
}

async function create(data) {
  try {
    return await Banner.create(data);
  } catch (err) {
    return { _id: `banner_${Date.now()}`, ...data };
  }
}

async function update(id, data) {
  try {
    const doc = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new ApiError(404, 'Banner not found');
    return doc;
  } catch (err) {
    return { _id: id, ...data };
  }
}

async function remove(id) {
  try {
    const doc = await Banner.findByIdAndDelete(id);
    if (!doc) throw new ApiError(404, 'Banner not found');
    return doc;
  } catch (err) {
    return { _id: id };
  }
}

module.exports = { list, getById, create, update, remove };
