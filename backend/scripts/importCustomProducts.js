const mongoose = require('../node_modules/mongoose');
require('../node_modules/dotenv').config({ path: 'backend/.env' });

const rawData = `,Product Type,Category,Sub-Category,Product name,Small,Medium,Large,XL,Size,Size in Avaialable,Cost Price (₹),Selling Price (₹),Total Pieces,Sold Pieces,Remaining Pieces
,Shirts,BOXY-FIT Shirts,Check Design,BLACK WITH MARRON RED WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,DARK GREY WITH MAROON RED & WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,GREY WITH BROWN & WHITE CHECKS---Street 17 GFX,0,0,1,0,,,,,1,,
,,,,GREY WITH BROWN & WHITE CHECKS---Will Not GFX,0,0,1,0,,,,,1,,
,,,,LIGHT BLUE WITH WHITE & BLACK---Street 17 GFX,0,1,0,0,,,,,1,,
,,,,LIGHT BLUE WITH WHITE & BLACK---Will Not GFX,0,0,2,0,,,,,2,,
,,,,LIGHT GREY WITH WHITE & BLACK CHECKS,0,1,0,0,,,,,1,,
,,,,MUSTARD YELLOW WITH GREY & WHITE CHECKS---Street 17 GFX,0,0,1,0,,,,,1,,
,,,,MUSTARD YELLOW WITH GREY & WHITE CHECKS---Nope GFX,0,1,0,0,,,,,1,,
,,,,SKY BLUE WITH GREY & WHITE CHECKS,0,0,1,0,,,,,1,,
,,,,TEAL GREEN WITH BLACK & WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,WHITE WITH BLACK & RED CHECKS,0,1,0,0,,,,,1,,
,,,,WHITE WITH BLUE CHECKS,0,0,1,0,,,,,1,,
,,,Plain Design,BEIGE,0,1,1,1,,,,,3,,
,,,,BLACK,0,1,1,1,,,,,3,,
,,,,BROWN,0,1,1,1,,,,,3,,
,,,,LIGHT BLUE,0,1,1,1,,,,,3,,
,,,,OFF WHITE-CREAM,0,1,1,1,,,,,3,,
,,,,WHITE,0,1,1,1,,,,,3,,
,,,,,,,,,,,,,,,
,,PATTERN Shirts,------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,DARK NAVY BLUE,0,1,1,1,,,,,3,,
,,,,WHITE,0,0,1,2,,,,,3,,
,,,,,,,,,,,,,,,
,,PLAIN Shirts,------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,DARK OLIVE GREEN,0,1,1,1,,,,,3,,
,,,,NAVY BLUE,0,1,1,1,,,,,3,,
,,,,RUST BROWN,0,1,1,1,,,,,3,,
,,,,WHITE,0,0,1,2,,,,,3,,
,,,,,,,,,,,,,,,
,,STRIP Shirts,------------------------,LIGHT BLUE & WHITE,0,2,0,1,,,,,3,,
,,,,LIGHT PINK & WHITE,0,0,0,3,,,,,3,,
,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,
,T-Shirts,Fleece henley,------------------------,BLACK,0,1,0,1,,,,,2,,
,,,,DARK CHARCOAL GREY,0,0,0,1,,,,,1,,
,,,,MINT GREEN,0,1,1,1,,,,,3,,
,,,,Peach Pink,0,1,2,1,,,,,3,,
,,,,Purple,0,1,0,1,,,,,2,,
,,,,,,,,,,,,,,,
,,Polo t-Shirts,Gucci,BLACK,0,0,1,0,,,,,1,,
,,,,LIGHT GREY,0,0,1,0,,,,,1,,
,,,,ROYAL BLUE,0,0,1,0,,,,,1,,
,,,,RUST BROWN,0,0,1,0,,,,,1,,
,,,,SLATE GREY,0,0,2,0,,,,,2,,
,,,Puma,BLACK,0,1,0,2,,,,,3,,
,,,,CREAM,0,1,1,0,,,,,2,,
,,,,MAUVE BROWN,0,1,1,1,,,,,3,,
,,,,RED,0,1,0,1,,,,,2,,
,,,,SLATY BLUE,0,2,0,1,,,,,3,,
,,,,WHITE,0,1,0,1,,,,,2,,
,,,Sports,BLACK,0,2,2,0,,,,,4,,
,,,,DUSKY PINK,0,1,1,0,,,,,2,,
,,,,OFF WHITE,0,1,1,0,,,,,2,,
,,,,RUST BROWN,0,2,2,0,,,,,4,,
,,,,RUST ORANGE,0,1,1,0,,,,,2,,
,,,,STEEL BLUE,0,2,2,0,,,,,4,,
,,,,,,,,,,,,,,,
,,Riders ,-------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,BLACK  WITH SLATE GREEN SLEEVES,0,1,3,1,,,,,5,,
,,,,BLACK WITH BROWN SLEEVES,0,1,0,1,,,,,2,,
,,,,BROWN,0,1,1,1,,,,,3,,
,,,,CREAM,0,1,1,1,,,,,3,,
,,,,RED,0,1,1,1,,,,,3,,
,,,,RED WITH WHITE SLEEVES,0,1,1,1,,,,,3,,
,,,,RUST BROWN WITH DARK BROWN SLEEVES,0,0,0,3,,,,,3,,
,,,,SLATE BLUE,0,1,1,1,,,,,3,,
,,,,SLATE GREEN WITH BLACK SLEEVES,0,1,1,1,,,,,3,,
,,,,WHITE,0,1,1,1,,,,,3,,
,,,,WHITE WITH OLIVE GREEN SLEEVES,0,1,0,0,,,,,1,,
,,,,WHITE WITH RED SLEEVES,0,0,0,1,,,,,1,,
,,,,,,,,,,,,,,,
,,Waffle,------------------------,BLACK---------------------------------LUIS GFX,0,0,0,3,,,,,3,,
,,,,BLACK---------------------------------MAFIA GFX,0,0,3,1,,,,,4,,
,,,,BLACK---------------------------------LOST YOUTH GFX,0,0,1,0,,,,,1,,
,,,,CAMEL BROWN,0,1,1,1,,,,,3,,
,,,,DARK BROWN,0,0,0,1,,,,,1,,
,,,,DARK GREEN,0,1,1,1,,,,,3,,
,,,,GREY---------------------------------MAFIA GFX,0,0,2,0,,,,,2,,
,,,,GREY---------------------------------LOST YOUTH GFX,0,0,0,1,,,,,1,,
,,,,MARRON RED,0,0,1,0,,,,,1,,
,,,,OLIVE GREEN,0,1,1,0,,,,,2,,
,,,,RED---------------------------------LUIS GFX,0,1,0,1,,,,,2,,
,,,,RED---------------------------------SAINT GFX,0,1,0,0,,,,,1,,
,,,,SAGE GREEN---------------------------------LUIS GFX,0,0,1,1,,,,,2,,
,,,,SAGE GREEN---------------------------------Punjabi Pop GFX,0,0,1,0,,,,,1,,
,,,,WHITE,0,1,1,1,,,,,3,,`;

const SHIRT_IMAGES = [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80'
];

const TSHIRT_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Category = mongoose.model('Category', new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: String,
    isActive: { type: Boolean, default: true }
  }, { timestamps: true }));

  const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    brand: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [{ type: String }],
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 10 },
    variants: [
      {
        size: String,
        color: String,
        sku: String,
        stock: { type: Number, default: 10 },
        price: Number,
      }
    ],
    fabric: String,
    fit: String,
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 }
  }, { timestamps: true }));

  // Helper to find or create category
  const categoryCache = {};
  async function getOrCreateCategory(name, parentId = null) {
    const slug = slugify(name);
    const cacheKey = `${slug}_${parentId || 'root'}`;
    if (categoryCache[cacheKey]) return categoryCache[cacheKey];

    let cat = await Category.findOne({ slug });
    if (!cat) {
      cat = await Category.create({
        name: titleCase(name),
        slug,
        parent: parentId,
        isActive: true,
        image: parentId ? null : (name.toLowerCase().includes('shirt') ? SHIRT_IMAGES[0] : TSHIRT_IMAGES[0])
      });
      console.log(`Created Category: ${cat.name} (${cat.slug})`);
    }
    categoryCache[cacheKey] = cat;
    return cat;
  }

  // Parse lines
  const lines = rawData.trim().split('\n');
  let curType = '';
  let curCategory = '';
  let curSubCategory = '';
  const parsedRows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(s => s.trim());
    if (parts.length < 5) continue;
    const [empty, pType, cat, subCat, pName, s, m, l, xl, size, sizeAvail, cost, sell, total, sold, rem] = parts;
    if (pType) curType = pType;
    if (cat) curCategory = cat;
    if (subCat) curSubCategory = subCat;

    if (!pName || pName.startsWith('---') || pName.replace(/-/g, '').length === 0) continue;

    const small = parseInt(s) || 0;
    const medium = parseInt(m) || 0;
    const large = parseInt(l) || 0;
    const xlarge = parseInt(xl) || 0;
    const totalPieces = parseInt(total) || (small + medium + large + xlarge);

    const cleanSubCat = (curSubCategory && !curSubCategory.startsWith('---')) ? curSubCategory : '';
    const cleanCategory = curCategory.trim();
    const cleanName = pName.replace(/-{3,}/g, ' - ').trim();

    parsedRows.push({
      productType: curType,
      categoryName: cleanCategory,
      subCategoryName: cleanSubCat,
      rawName: cleanName,
      small,
      medium,
      large,
      xlarge,
      totalPieces
    });
  }

  console.log(`Found ${parsedRows.length} rows to import`);

  let createdCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < parsedRows.length; idx++) {
    const row = parsedRows[idx];

    // Parent Type Category (Shirts or T-Shirts)
    const parentCat = await getOrCreateCategory(row.productType, null);

    // Sub Category
    const subCat = await getOrCreateCategory(row.categoryName, parentCat._id);

    // Minor child subCategory if present (e.g. "Check Design", "Plain Design", "Gucci")
    let childSubCat = null;
    if (row.subCategoryName) {
      childSubCat = await getOrCreateCategory(row.subCategoryName, subCat._id);
    }

    const isShirt = row.productType.toLowerCase().includes('shirt') && !row.productType.toLowerCase().includes('t-shirt');
    const price = isShirt ? 999 : 699;
    const mrp = isShirt ? 1999 : 1399;
    const discount = Math.round(((mrp - price) / mrp) * 100);

    const imagePool = isShirt ? SHIRT_IMAGES : TSHIRT_IMAGES;
    const image = imagePool[idx % imagePool.length];

    // Build standard readable title
    let displayTitle = '';
    const formattedItemName = titleCase(row.rawName);
    if (row.subCategoryName) {
      displayTitle = `${titleCase(row.categoryName)} (${titleCase(row.subCategoryName)}) - ${formattedItemName}`;
    } else {
      displayTitle = `${titleCase(row.categoryName)} - ${formattedItemName}`;
    }

    let baseSlug = slugify(displayTitle);
    if (!baseSlug) baseSlug = `product-${idx + 1}`;

    // Variants
    const variants = [];
    if (row.small > 0) variants.push({ size: 'S', stock: row.small, price });
    if (row.medium > 0) variants.push({ size: 'M', stock: row.medium, price });
    if (row.large > 0) variants.push({ size: 'L', stock: row.large, price });
    if (row.xlarge > 0) variants.push({ size: 'XL', stock: row.xlarge, price });
    // Default fallback variant if 0
    if (variants.length === 0) {
      variants.push({ size: 'M', stock: Math.max(1, row.totalPieces), price });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    // Check if product exists by baseSlug
    let product = await Product.findOne({
      $or: [
        { slug: baseSlug },
        { name: displayTitle }
      ]
    });

    if (product) {
      product.name = displayTitle;
      product.price = price;
      product.mrp = mrp;
      product.discount = discount;
      product.stock = totalStock;
      product.variants = variants;
      product.category = subCat._id;
      product.subCategory = childSubCat ? childSubCat._id : null;
      product.isActive = true;
      await product.save();
      updatedCount++;
    } else {
      // Ensure slug uniqueness
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      await Product.create({
        name: displayTitle,
        slug: uniqueSlug,
        brand: 'AMAYAAR',
        category: subCat._id,
        subCategory: childSubCat ? childSubCat._id : null,
        description: `Premium ${titleCase(row.categoryName)} in signature ${formattedItemName}. Designed with high-density fabric, precision tailoring, and modern streetwear aesthetic.`,
        price,
        mrp,
        discount,
        stock: totalStock,
        variants,
        images: [image],
        fabric: isShirt ? '100% Premium Cotton' : 'Heavyweight Cotton / Fleece Waffle',
        fit: 'Boxy / Oversized Streetwear Fit',
        isActive: true,
        rating: 4.8
      });
      createdCount++;
    }
  }

  console.log(`\nImport Complete!`);
  console.log(`Created: ${createdCount} products`);
  console.log(`Updated: ${updatedCount} products`);
  console.log(`Total in inventory: ${createdCount + updatedCount}`);

  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
