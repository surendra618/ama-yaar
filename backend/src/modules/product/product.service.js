const Product = require('./product.model');
const Category = require('../category/category.model');
const ApiError = require('../../utils/ApiError');

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
  const {
    search,
    category,
    subCategory,
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
    activeOnly = 'false',
  } = query;

  const filter = {};

  if (activeOnly === 'true') {
    filter.isActive = true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category) {
    // If category is slug, find ID first
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        // Also include child subcategories if parent
        const childCats = await Category.find({ parent: catDoc._id }).select('_id');
        const catIds = [catDoc._id, ...childCats.map((c) => c._id)];
        filter.category = { $in: catIds };
      }
    } else {
      const childCats = await Category.find({ parent: category }).select('_id');
      const catIds = [category, ...childCats.map((c) => c._id)];
      filter.category = { $in: catIds };
    }
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

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (minDiscount) {
    filter.discount = { $gte: Number(minDiscount) };
  }

  if (inStock === 'true' || inStock === true) {
    filter.stock = { $gt: 0 };
  }

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
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
}

async function getByIdOrSlug(idOrSlug) {
  let doc;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    doc = await Product.findById(idOrSlug)
      .populate('category', 'name slug parent')
      .populate('subCategory', 'name slug');
  }
  if (!doc) {
    doc = await Product.findOne({ slug: idOrSlug })
      .populate('category', 'name slug parent')
      .populate('subCategory', 'name slug');
  }
  if (!doc) throw new ApiError(404, 'Product not found');

  // Fetch related products
  const related = await Product.find({
    category: doc.category?._id || doc.category,
    _id: { $ne: doc._id },
    isActive: true,
  })
    .limit(4)
    .populate('category', 'name slug');

  const docObj = doc.toObject();
  docObj.related = related;
  return docObj;
}

async function getFilterOptions(query = {}) {
  const brands = await Product.distinct('brand', { isActive: true });
  const priceStats = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
  ]);

  const categories = await Category.find({ isActive: true, parent: null }).select('name slug');

  return {
    brands: brands.filter(Boolean),
    minPrice: priceStats[0]?.minPrice || 0,
    maxPrice: priceStats[0]?.maxPrice || 50000,
    categories,
  };
}

async function create(data) {
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }
  const existing = await Product.findOne({ slug: data.slug });
  if (existing) {
    data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
  }
  return Product.create(data);
}

async function update(id, data) {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  const doc = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Product not found');
  return doc;
}

async function remove(id) {
  const doc = await Product.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Product not found');
  return doc;
}

module.exports = { list, getByIdOrSlug, getFilterOptions, create, update, remove };
