const Category = require('./category.model');
const Product = require('../product/product.model');
const ApiError = require('../../utils/ApiError');

const fallbackCategories = [
  { _id: 'cat_f1', name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', isActive: true, productCount: 12 },
  { _id: 'cat_f2', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80', isActive: true, productCount: 24 },
  { _id: 'cat_f3', name: 'Home & Living', slug: 'home-and-living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80', isActive: true, productCount: 18 },
  { _id: 'cat_f4', name: 'Beauty & Wellness', slug: 'beauty-and-wellness', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', isActive: true, productCount: 15 },
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

// In-memory cache for ultra-fast category responses
let categoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function clearCategoryCache() {
  categoryCache.clear();
}

async function list(query = {}) {
  try {
    const { parent, tree, activeOnly = 'false' } = query;
    const cacheKey = JSON.stringify({ parent, tree, activeOnly });
    const cached = categoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const filter = {};
    if (activeOnly === 'true') filter.isActive = true;
    if (parent !== undefined) {
      filter.parent = parent === 'null' || parent === '' ? null : parent;
    }

    const categories = await Category.find(filter).populate('parent').sort({ name: 1 }).lean();

    // Fast 1-shot aggregation to count products by category
    const countsMap = {};
    try {
      const counts = await Product.aggregate([
        {
          $facet: {
            byCat: [{ $match: { category: { $ne: null } } }, { $group: { _id: '$category', count: { $sum: 1 } } }],
            bySubCat: [{ $match: { subCategory: { $ne: null } } }, { $group: { _id: '$subCategory', count: { $sum: 1 } } }],
          },
        },
      ]);
      if (counts && counts[0]) {
        (counts[0].byCat || []).forEach((c) => {
          if (c._id) countsMap[c._id.toString()] = (countsMap[c._id.toString()] || 0) + c.count;
        });
        (counts[0].bySubCat || []).forEach((c) => {
          if (c._id) countsMap[c._id.toString()] = (countsMap[c._id.toString()] || 0) + c.count;
        });
      }
    } catch (_) {}

    const categoriesWithCounts = categories.map((cat) => ({
      ...cat,
      productCount: countsMap[cat._id.toString()] || 0,
    }));

    let result = categoriesWithCounts;
    if (tree === 'true') {
      const rootCats = categoriesWithCounts.filter((c) => !c.parent);
      result = rootCats.map((root) => ({
        ...root,
        subcategories: categoriesWithCounts.filter(
          (c) => c.parent && (c.parent._id || c.parent).toString() === root._id.toString()
        ),
      }));
    }

    categoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn('[category.service] Query error:', err.message);
    return [];
  }
}

async function getByIdOrSlug(idOrSlug) {
  try {
    let doc;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await Category.findById(idOrSlug).populate('parent');
    }
    if (!doc) {
      doc = await Category.findOne({ slug: idOrSlug }).populate('parent');
    }
    return doc || null;
  } catch (err) {
    return null;
  }
}

async function create(data) {
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }
  const created = await Category.create(data);
  clearCategoryCache();
  return created;
}

async function update(id, data) {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { _id: id, ...data };
  }
  const doc = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Category not found');
  clearCategoryCache();
  return doc;
}

async function remove(id) {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return { _id: id };
  }
  const doc = await Category.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Category not found');
  clearCategoryCache();
  return doc;
}

module.exports = { list, getByIdOrSlug, create, update, remove };
