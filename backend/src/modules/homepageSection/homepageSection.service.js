const HomepageSection = require('./homepageSection.model');

const DEFAULT_SECTIONS = {
  workout_top_picks: {
    tag: 'OUR TOP PICKS',
    headingLine1: 'TOP WORKOUT GEAR FOR',
    headingLine2: 'PEAK PERFORMANCE!',
    subtitle: 'Discover the best of our collection, designed to power your workouts all year round.',
    isActive: true,
    card1: {
      image: '/home img/workout_winter.jpg',
      season: '01/WINTER _2025',
      heading: 'TOP\nWORKOUT\nGEAR FOR\nPEAK\nPERFORMA\nNICE!',
      tag: 'TOP SELLING GEAR',
      link: '/products',
      isActive: true,
    },
    card2: {
      image: '/home img/workout_summer.jpg',
      season: '02/SUMMER _2025',
      heading: 'LATEST\nSTYLES AND\nINNOVATIONS\nIN WORKOUT\nGEAR.',
      tag: 'NEW ARRIVAL',
      link: '/products',
      isActive: true,
    },
  },
  editorial_nocta: {
    headline: 'THE NOCTA\nCOLLECTION',
    subtitle: 'Made for the night shift. / Worn around the clock.',
    buttonText: 'Shop now',
    buttonLink: '/products',
    baseModelImage: '/nocta-stage/model-base.jpg',
    isActive: true,
    slides: [
      {
        id: 'slide_1',
        name: 'PUFFER JACKET 01',
        category: 'OUTERWEAR / DROP 01',
        garment: '/nocta-stage/garment-01.png',
        link: '/products',
      },
      {
        id: 'slide_2',
        name: 'TACTICAL HOODIE 02',
        category: 'HEAVY FLEECE / DROP 02',
        garment: '/nocta-stage/garment-02.png',
        link: '/products',
      },
      {
        id: 'slide_3',
        name: 'CREWNECK SWEATSHIRT 03',
        category: 'OVERSIZED TERRY / DROP 03',
        garment: '/nocta-stage/garment-03.png',
        link: '/products',
      },
      {
        id: 'slide_4',
        name: 'TECH FLEECE ZIP 04',
        category: 'ESSENTIAL LAYER / DROP 04',
        garment: '/nocta-stage/garment-04.png',
        link: '/products',
      },
    ],
  },
};

let sectionCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

function clearCache() {
  sectionCache.clear();
}

async function getByKey(key, bypassCache = false) {
  const cleanKey = String(key || '').trim().toLowerCase();
  if (!bypassCache && sectionCache.has(cleanKey)) {
    const cached = sectionCache.get(cleanKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const doc = await HomepageSection.findOne({ key: cleanKey }).lean();
    let result = doc ? doc.data : DEFAULT_SECTIONS[cleanKey];

    if (!result) {
      result = DEFAULT_SECTIONS[cleanKey] || { key: cleanKey, isActive: true };
    }

    sectionCache.set(cleanKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn(`[homepageSection.service] DB fetch failed for key "${cleanKey}":`, err.message);
    return DEFAULT_SECTIONS[cleanKey] || { key: cleanKey, isActive: true };
  }
}

async function updateByKey(key, data, isActive = true) {
  const cleanKey = String(key || '').trim().toLowerCase();
  clearCache();

  try {
    const updated = await HomepageSection.findOneAndUpdate(
      { key: cleanKey },
      { key: cleanKey, data, isActive: isActive !== false },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return updated ? updated.data : data;
  } catch (err) {
    console.error(`[homepageSection.service] DB update failed for key "${cleanKey}":`, err.message);
    return data;
  }
}

async function listAll() {
  try {
    const docs = await HomepageSection.find({ isActive: true }).lean();
    const map = {};
    Object.keys(DEFAULT_SECTIONS).forEach((k) => {
      map[k] = DEFAULT_SECTIONS[k];
    });
    if (docs && docs.length > 0) {
      docs.forEach((doc) => {
        map[doc.key] = doc.data;
      });
    }
    return map;
  } catch (err) {
    console.warn('[homepageSection.service] DB list failed, returning defaults:', err.message);
    return DEFAULT_SECTIONS;
  }
}

module.exports = {
  getByKey,
  updateByKey,
  listAll,
  clearCache,
  DEFAULT_SECTIONS,
};
