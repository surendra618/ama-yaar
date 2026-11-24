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
  instagram_banner: {
    image: '/insta-banner-1920x500.jpg',
    link: 'https://instagram.com/amayaar.in',
    title: 'Follow AMA YAAR on Instagram',
    openInNewTab: true,
    isActive: true,
  },
  happy_customers: {
    headingPrefix: 'OUR HAPPY',
    headingHighlight: 'Customers',
    subtitle: 'Real style, real comfort. Here is what our customers have to say about AMA YAAR.',
    isActive: true,
    reviews: [
      {
        id: 'rev_1',
        name: 'Vansh Singh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        text: 'Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!',
        isVerified: true,
        product: {
          name: 'Classic Heavyweight Polo T-Shirt',
          image: '/model03.png',
          price: 499,
          variant: 'Size: M • Slate Black',
          slug: 'mens-classic-polo-t-shirt',
        },
      },
      {
        id: 'rev_2',
        name: 'Rohan Verma',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        text: 'Amaze quality! Zipper polo ki fitting aur stitching bilkul top notch hai. Delivery fast thi aur packaging premium lagti hai.',
        isVerified: true,
        product: {
          name: 'Urban Zipper Heavyweight Oversized Polo',
          image: '/side.png',
          price: 549,
          variant: 'Size: L • Washed Grey',
          slug: 'urban-zipper-heavyweight-oversized-polo',
        },
      },
      {
        id: 'rev_3',
        name: 'Arjun Yadav',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        text: 'Heavyweight drop tee meri favourite purchase rahi! Comfortable, stylish aur perfect fitting. Quality expectations se better nikli.',
        isVerified: true,
        product: {
          name: 'Heavyweight Boxy Graphic T-Shirt',
          image: '/model01.png',
          price: 499,
          variant: 'Size: XL • Vintage Black',
          slug: 'heavyweight-waffle-knit-t-shirt-dark-green-70',
        },
      },
      {
        id: 'rev_4',
        name: 'Sunil Kashyap',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        text: 'Oversized t-shirt ka fabric kaafi comfortable hai aur stitching bhi achhi hai. Pehli baar order kiya tha, delivery expected se better nikli.',
        isVerified: true,
        product: {
          name: 'Streetwear Essential Oversized Tee',
          image: '/model08.jpg',
          price: 499,
          variant: 'Size: L • Off-Black',
          slug: 'relaxed-henley-neck-streetwear-tee',
        },
      },
      {
        id: 'rev_5',
        name: 'Ved Singh',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80',
        rating: 5,
        date: '1 month ago',
        text: 'Heavyweight graphic tee ka print aur fabric unmatched hai. Wash ke baad bhi color aur shape fade nahi hota. Best streetwear pickup!',
        isVerified: true,
        product: {
          name: 'Oversized Stylish Graphic T-shirt',
          image: '/model01.png',
          price: 450,
          variant: 'Size: L • Black',
          slug: 'oversized-stylish-graphic-t-shirt',
        },
      },
      {
        id: 'rev_6',
        name: 'Kabir Sharma',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80',
        rating: 5,
        date: '1 month ago',
        text: 'Minimal streetwear look ke liye ye brand best hai. Comfort level 10/10. Definitely recommendation worthy!',
        isVerified: true,
        product: {
          name: "Men's Vintage Acid Wash Denim Trucker Jacket",
          image: '/boyse.png',
          price: 799,
          variant: 'Size: M • Acid Wash',
          slug: 'mens-vintage-acid-wash-fleece-lined-denim-trucker-jacket',
        },
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
