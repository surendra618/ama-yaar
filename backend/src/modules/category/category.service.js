const Category = require('./category.model');
const Product = require('../product/product.model');
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
  const { parent, tree, activeOnly = 'false' } = query;
  const filter = {};
  if (activeOnly === 'true') filter.isActive = true;
  if (parent !== undefined) {
    filter.parent = parent === 'null' || parent === '' ? null : parent;
  }

  const categories = await Category.find(filter).populate('parent').sort({ name: 1 });

  // Add product counts
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({
        $or: [{ category: cat._id }, { subCategory: cat._id }],
      });
      const obj = cat.toObject();
      obj.productCount = count;
      return obj;
    })
  );

  if (tree === 'true') {
    // Build tree
    const rootCats = categoriesWithCounts.filter((c) => !c.parent);
    return rootCats.map((root) => ({
      ...root,
      subcategories: categoriesWithCounts.filter(
        (c) => c.parent && (c.parent._id || c.parent).toString() === root._id.toString()
      ),
    }));
  }

  return categoriesWithCounts;
}

async function getByIdOrSlug(idOrSlug) {
  let doc;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    doc = await Category.findById(idOrSlug).populate('parent');
  }
  if (!doc) {
    doc = await Category.findOne({ slug: idOrSlug }).populate('parent');
  }
  if (!doc) throw new ApiError(404, 'Category not found');
  return doc;
}

async function create(data) {
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }
  const existing = await Category.findOne({ slug: data.slug });
  if (existing) {
    data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
  }
  return Category.create(data);
}

async function update(id, data) {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  const doc = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Category not found');
  return doc;
}

async function remove(id) {
  // Check if has subcategories
  const hasSub = await Category.findOne({ parent: id });
  if (hasSub) throw new ApiError(400, 'Cannot delete category with subcategories. Remove subcategories first.');

  const doc = await Category.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Category not found');
  return doc;
}

module.exports = { list, getByIdOrSlug, create, update, remove };
