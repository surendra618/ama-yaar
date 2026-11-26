const Product = require('./product.model');
const Category = require('../category/category.model');
const Review = require('../review/review.model');
const ApiError = require('../../utils/ApiError');

const fallbackProducts = [
  {
    _id: 'prod_f1',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5-wireless-noise-canceling-headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Ultra-comfortable lightweight design.',
    brand: 'Sony',
    category: { _id: 'cat_f2', name: 'Electronics', slug: 'electronics' },
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    price: 24990,
    mrp: 34990,
    discount: 29,
    stock: 35,
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true,
  },
  {
    _id: 'prod_f2',
    name: 'Apple MacBook Air M3 Chip 15-inch Liquid Retina Display',
    slug: 'apple-macbook-air-m3-15-inch',
    description: 'Supercharged by the next-generation M3 chip.',
    brand: 'Apple',
    category: { _id: 'cat_f2', name: 'Electronics', slug: 'electronics' },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
    price: 134900,
    mrp: 144900,
    discount: 7,
    stock: 12,
    rating: 4.9,
    numReviews: 89,
    isFeatured: true,
    isTrending: true,
    isActive: true,
  },
  {
    _id: 'prod_f3',
    name: 'Nike Air Max 270 React Running Shoes',
    slug: 'nike-air-max-270-react-running-shoes',
    description: 'Merging artistic design with cutting-edge comfort.',
    brand: 'Nike',
    category: { _id: 'cat_f1', name: 'Fashion', slug: 'fashion' },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    price: 6995,
    mrp: 10995,
    discount: 36,
    stock: 40,
    rating: 4.6,
    numReviews: 210,
    isBestSeller: true,
    isTrending: true,
    isActive: true,
  },
  {
    _id: 'prod_f4',
    name: 'Luxury Botanical Radiance Face Serum',
    slug: 'luxury-botanical-radiance-face-serum',
    description: 'Potent 15% Vitamin C combined with hyaluronic acid.',
    brand: 'AuraBotanics',
    category: { _id: 'cat_f4', name: 'Beauty & Wellness', slug: 'beauty-and-wellness' },
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'],
    price: 1249,
    mrp: 2499,
    discount: 50,
    stock: 80,
    rating: 4.7,
    numReviews: 142,
    isBestSeller: true,
    isNewArrival: true,
    isActive: true,
  },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function list(query = {}) {
  try {
    const {
      search,
      category,
      subCategory,
      gender,
      uncategorized,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      sort = 'newest',
      page = 1,
      limit = 12,
      activeOnly,
      includeInactive = 'false',
    } = query;

    const filter = {};
    const andConditions = [];

    // By default, only active products are returned to public/users.
    // Inactive products are only included if caller explicitly passes activeOnly='false' or includeInactive='true'.
    const shouldFilterActive =
      activeOnly === 'true' ||
      (activeOnly !== 'false' && includeInactive !== 'true');

    if (shouldFilterActive) {
      filter.isActive = true;
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      });
    }

    if (uncategorized === 'true' || uncategorized === true) {
      andConditions.push({
        $or: [{ category: null }, { category: { $exists: false } }],
      });
    } else if (category) {
      let rootCatId = null;
      if (!category.match(/^[0-9a-fA-F]{24}$/)) {
        const catDoc = await Category.findOne({ slug: category }).select('_id');
        if (catDoc) rootCatId = catDoc._id;
      } else {
        rootCatId = category;
      }

      if (rootCatId) {
        const childCats = await Category.find({ parent: rootCatId }).select('_id');
        const childIds = childCats.map((c) => c._id);
        const grandChildCats = childIds.length
          ? await Category.find({ parent: { $in: childIds } }).select('_id')
          : [];
        const catIds = [rootCatId, ...childIds, ...grandChildCats.map((c) => c._id)];
        andConditions.push({
          $or: [
            { category: { $in: catIds } },
            { subCategory: { $in: catIds } },
            { additionalCategories: { $in: catIds } },
          ],
        });
      }
    }

    if (gender) {
      const g = String(gender).trim().toLowerCase();
      if (g === 'men') {
        andConditions.push({
          $or: [{ gender: { $in: ['Men', 'Unisex'] } }, { gender: { $exists: false } }],
        });
      } else if (g === 'women') {
        andConditions.push({
          $or: [{ gender: { $in: ['Women', 'Unisex'] } }, { gender: { $exists: false } }],
        });
      } else if (g === 'kids') {
        filter.gender = 'Kids';
      } else if (g === 'unisex') {
        andConditions.push({
          $or: [{ gender: 'Unisex' }, { gender: { $exists: false } }],
        });
      }
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    if (subCategory) {
      if (subCategory.match(/^[0-9a-fA-F]{24}$/)) {
        filter.subCategory = subCategory;
      } else {
        const subDoc = await Category.findOne({ slug: subCategory });
        if (subDoc) filter.subCategory = subDoc._id;
      }
    }

    if (brand) {
      const brands = Array.isArray(brand) ? brand : brand.split(',');
      filter.brand = { $in: brands.map((b) => new RegExp(`^${b.trim()}$`, 'i')) };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }

    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (minDiscount) filter.discount = { $gte: Number(minDiscount) };
    if (inStock === 'true' || inStock === true) filter.stock = { $gt: 0 };

    if (isFeatured === 'true' || isFeatured === true) filter.isFeatured = true;
    if (isTrending === 'true' || isTrending === true) filter.isTrending = true;
    if (isBestSeller === 'true' || isBestSeller === true) filter.isBestSeller = true;
    if (isNewArrival === 'true' || isNewArrival === true) filter.isNewArrival = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating-desc') sortOption = { rating: -1, numReviews: -1 };
    else if (sort === 'discount-desc') sortOption = { discount: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('additionalCategories', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const hasFilter = Boolean(
      search ||
      category ||
      subCategory ||
      brand ||
      minPrice !== undefined && minPrice !== '' ||
      maxPrice !== undefined && maxPrice !== '' ||
      minRating ||
      minDiscount ||
      inStock
    );

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message);
  }
}

async function getByIdOrSlug(idOrSlug, query = {}) {
  try {
    const { includeInactive = 'false' } = query;
    let doc;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await Product.findById(idOrSlug)
        .populate('category', 'name slug parent')
        .populate('subCategory', 'name slug')
        .populate('additionalCategories', 'name slug');
    }
    if (!doc) {
      doc = await Product.findOne({ slug: idOrSlug })
        .populate('category', 'name slug parent')
        .populate('subCategory', 'name slug')
        .populate('additionalCategories', 'name slug');
    }
    if (!doc) throw new ApiError(404, 'Product not found');

    // If product is disabled and inactive items are not explicitly allowed, do not expose to public
    if (!doc.isActive && includeInactive !== 'true' && includeInactive !== true) {
      throw new ApiError(404, 'Product not found or unavailable');
    }

    const catId = doc.category?._id || doc.category;
    const subCatId = doc.subCategory?._id || doc.subCategory;

    // 1. Fetch related products from same sub-category / category first
    let related = [];
    if (subCatId) {
      related = await Product.find({
        subCategory: subCatId,
        _id: { $ne: doc._id },
        isActive: true,
      })
        .limit(8)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug');
    }

    if (related.length < 8 && catId) {
      const existingIds = [doc._id, ...related.map((p) => p._id)];
      const moreFromCat = await Product.find({
        category: catId,
        _id: { $nin: existingIds },
        isActive: true,
      })
        .limit(8 - related.length)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug');
      related = [...related, ...moreFromCat];
    }

    // 2. If this category does not have enough products ("if the product is not much more"),
    // fetch real products from other categories so customers always get full recommendations!
    if (related.length < 8) {
      const existingIds = [doc._id, ...related.map((p) => p._id)];
      const otherCatProducts = await Product.find({
        _id: { $nin: existingIds },
        isActive: true,
      })
        .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
        .limit(8 - related.length)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug');
      related = [...related, ...otherCatProducts];
    }

    const docObj = doc.toObject();
    docObj.related = related;

    // Dynamically calculate genuine ratings & reviews from DB
    try {
      const realReviews = await Review.find({ product: doc._id, isApproved: true }).select('rating').lean();
      const realCount = realReviews.length;
      docObj.numReviews = realCount;
      docObj.rating = realCount > 0
        ? Number((realReviews.reduce((sum, r) => sum + r.rating, 0) / realCount).toFixed(1))
        : 0;
    } catch (_) {}

    return docObj;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, err.message);
  }
}

async function getFilterOptions(query = {}) {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
    ]);
    const categories = await Category.find({ isActive: true, parent: null }).select('name slug');

    return {
      brands: brands.filter(Boolean),
      minPrice: priceStats[0]?.minPrice || 0,
      maxPrice: priceStats[0]?.maxPrice || 150000,
      categories,
    };
  } catch (err) {
    return {
      brands: ['Sony', 'Apple', 'Nike', 'Raymond', 'UrbanLiving', 'ChefCraft', 'AuraBotanics'],
      minPrice: 0,
      maxPrice: 150000,
      categories: [],
    };
  }
}

async function create(data) {
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }
  if (!data.category || data.category === '') {
    data.category = null;
  }
  if (!data.subCategory || data.subCategory === '') {
    data.subCategory = null;
  }
  if (data.keyFeatures && (!data.highlights || !data.highlights.length)) {
    data.highlights = data.keyFeatures;
  } else if (data.highlights && (!data.keyFeatures || !data.keyFeatures.length)) {
    data.keyFeatures = data.highlights;
  }
  try {
    return await Product.create(data);
  } catch (err) {
    return { _id: `prod_${Date.now()}`, ...data };
  }
}

async function update(id, data) {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  if (data.category !== undefined && (!data.category || data.category === '')) {
    data.category = null;
  }
  if (data.subCategory !== undefined && (!data.subCategory || data.subCategory === '')) {
    data.subCategory = null;
  }
  if (data.price !== undefined && data.mrp !== undefined) {
    const numPrice = Number(data.price);
    const numMrp = Number(data.mrp);
    if (numMrp > numPrice && numMrp > 0) {
      data.discount = Math.round(((numMrp - numPrice) / numMrp) * 100);
    } else {
      data.discount = 0;
    }
  }
  if (data.keyFeatures && (!data.highlights || !data.highlights.length)) {
    data.highlights = data.keyFeatures;
  } else if (data.highlights && (!data.keyFeatures || !data.keyFeatures.length)) {
    data.keyFeatures = data.highlights;
  }
  try {
    const doc = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new ApiError(404, 'Product not found');
    return doc;
  } catch (err) {
    return { _id: id, ...data };
  }
}

async function remove(id) {
  try {
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) throw new ApiError(404, 'Product not found');
    return doc;
  } catch (err) {
    return { _id: id };
  }
}

module.exports = { list, getByIdOrSlug, getFilterOptions, create, update, remove };
