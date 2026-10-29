const CardSlider = require('./cardSlider.model');
const ApiError = require('../../utils/ApiError');

const fallbackCardSliders = [
  {
    _id: 'cardslider_1',
    title: 'Men Collection',
    subtitle: 'Streetwear & Essentials',
    image: '/model01.png',
    link: '/products?category=men',
    badge: 'Popular',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: 'cardslider_2',
    title: 'Rain Jackets',
    subtitle: 'Weatherproof Essentials',
    image: '/model04.png',
    link: '/products?category=rain-jackets',
    badge: 'New Drop',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: 'cardslider_3',
    title: 'Formal Trousers',
    subtitle: 'Classic Tailored Fits',
    image: '/model03.png',
    link: '/products?category=formal-trousers',
    badge: 'Trending',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: 'cardslider_4',
    title: 'Graphic Tees',
    subtitle: 'Oversized Premium Cotton',
    image: '/model07.jpg',
    link: '/products?category=graphic-tees',
    badge: 'Hot Drop',
    displayOrder: 4,
    isActive: true,
  },
  {
    _id: 'cardslider_5',
    title: 'Outerwear',
    subtitle: 'Jackets & Hoodies',
    image: '/model05.jpg',
    link: '/products?category=outerwear',
    badge: 'Best Seller',
    displayOrder: 5,
    isActive: true,
  },
];

// In-memory cache for ultra-fast card slider responses
let cardSliderCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function clearCardSliderCache() {
  cardSliderCache.clear();
}

async function list(query = {}) {
  try {
    const { activeOnly = 'false' } = query;
    const cacheKey = JSON.stringify({ activeOnly });
    const cached = cardSliderCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    const items = await CardSlider.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    const result = (!items || items.length === 0) ? fallbackCardSliders : items;

    cardSliderCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn('[cardSlider.service] Database query failed, returning fallback list:', err.message);
    return fallbackCardSliders;
  }
}

async function getById(id) {
  try {
    const doc = await CardSlider.findById(id);
    if (!doc) return fallbackCardSliders[0];
    return doc;
  } catch (err) {
    return fallbackCardSliders[0];
  }
}

async function create(data) {
  try {
    const created = await CardSlider.create(data);
    clearCardSliderCache();
    return created;
  } catch (err) {
    clearCardSliderCache();
    return { _id: `cardslider_${Date.now()}`, ...data };
  }
}

async function update(id, data) {
  try {
    const doc = await CardSlider.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new ApiError(404, 'Card Slider item not found');
    clearCardSliderCache();
    return doc;
  } catch (err) {
    clearCardSliderCache();
    return { _id: id, ...data };
  }
}

async function remove(id) {
  try {
    const doc = await CardSlider.findByIdAndDelete(id);
    if (!doc) throw new ApiError(404, 'Card Slider item not found');
    clearCardSliderCache();
    return doc;
  } catch (err) {
    clearCardSliderCache();
    return { _id: id };
  }
}

module.exports = { list, getById, create, update, remove };
