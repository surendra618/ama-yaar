const xlsx = require('xlsx');
const Product = require('./product.model');
const Category = require('../category/category.model');

const SHIRT_IMAGES = [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
];

const TSHIRT_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
];

function slugify(text) {
  if (!text) return '';
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
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  if (url.includes('dropbox.com') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }
  return url;
}

const KNOWN_SIZE_MAP = {
  'xs': 'XS',
  'extra small': 'XS',
  's': 'S',
  'small': 'S',
  'm': 'M',
  'medium': 'M',
  'l': 'L',
  'large': 'L',
  'xl': 'XL',
  'extra large': 'XL',
  'xxl': 'XXL',
  '2xl': 'XXL',
  'xxxl': '3XL',
  '3xl': '3XL',
  '4xl': '4XL',
  '5xl': '5XL',
  'free size': 'Free Size',
  'freesize': 'Free Size',
  'one size': 'One Size',
  'onesize': 'One Size',
  'os': 'One Size',
  '28': '28',
  '30': '30',
  '32': '32',
  '34': '34',
  '36': '36',
  '38': '38',
  '40': '40',
  '42': '42',
  '44': '44',
};

async function bulkImportProductsFromBuffer(buffer, originalname = '') {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel/CSV file is empty');
  }

  // Find header row and column mappings
  let headerRowIndex = -1;
  let pTypeIdx = -1;
  let catIdx = -1;
  let subCatIdx = -1;
  let nameIdx = -1;
  let costIdx = -1;
  let sellIdx = -1;
  let totalIdx = -1;
  let imageIdx = -1;
  let sizeListIdx = -1;
  let descIdx = -1;
  let fabricIdx = -1;
  let fitIdx = -1;
  let brandIdx = -1;
  const detectedSizeColumns = [];

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r].map((cell) => String(cell || '').trim().toLowerCase());
    const rowStr = row.join(' ');
    if (rowStr.includes('product') || rowStr.includes('category') || rowStr.includes('small') || rowStr.includes('price')) {
      headerRowIndex = r;
      row.forEach((col, idx) => {
        if (col.includes('product type') || (col.includes('type') && !col.includes('product name'))) pTypeIdx = idx;
        else if (col.includes('sub-category') || col.includes('sub category') || col.includes('subcategory')) subCatIdx = idx;
        else if (col.includes('category')) catIdx = idx;
        else if (col.includes('product name') || col.includes('name') || col.includes('title')) nameIdx = idx;
        else if (KNOWN_SIZE_MAP[col]) {
          detectedSizeColumns.push({ label: KNOWN_SIZE_MAP[col], idx });
        }
        else if (col === 'size' || col === 'sizes' || col.includes('size in') || col.includes('available size')) sizeListIdx = idx;
        else if (col.includes('cost')) costIdx = idx;
        else if (col.includes('selling') || col === 'price' || col.includes('price (₹)')) sellIdx = idx;
        else if (col.includes('total') || col.includes('stock') || col.includes('qty')) totalIdx = idx;
        else if (col.includes('image') || col.includes('photo') || col.includes('img') || col.includes('picture')) imageIdx = idx;
        else if (col.includes('desc') || col.includes('detail') || col.includes('about')) descIdx = idx;
        else if (col.includes('fabric') || col.includes('material')) fabricIdx = idx;
        else if (col.includes('fit')) fitIdx = idx;
        else if (col.includes('brand')) brandIdx = idx;
      });
      break;
    }
  }

  // Fallback defaults if header row wasn't fully named
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }
  if (nameIdx === -1) nameIdx = 4;
  if (catIdx === -1) catIdx = 2;
  if (pTypeIdx === -1) pTypeIdx = 1;
  if (subCatIdx === -1) subCatIdx = 3;
  if (costIdx === -1) costIdx = 11;
  if (sellIdx === -1) sellIdx = 12;
  if (totalIdx === -1) totalIdx = 13;

  // If no size columns were identified, default to standard S, M, L, XL at 5, 6, 7, 8
  if (detectedSizeColumns.length === 0) {
    detectedSizeColumns.push(
      { label: 'S', idx: 5 },
      { label: 'M', idx: 6 },
      { label: 'L', idx: 7 },
      { label: 'XL', idx: 8 }
    );
  }

  const categoryCache = {};
  async function getOrCreateCategory(name, parentId = null) {
    if (!name) return null;
    const slug = slugify(name);
    if (!slug) return null;
    const cacheKey = `${slug}_${parentId || 'root'}`;
    if (categoryCache[cacheKey]) return categoryCache[cacheKey];

    let cat = await Category.findOne({ slug });
    if (!cat) {
      cat = await Category.create({
        name: titleCase(name),
        slug,
        parent: parentId,
        isActive: true,
        image: parentId ? null : (name.toLowerCase().includes('shirt') ? SHIRT_IMAGES[0] : TSHIRT_IMAGES[0]),
      });
    }
    categoryCache[cacheKey] = cat;
    return cat;
  }

  let curType = 'Clothing';
  let curCategory = 'Apparel';
  let curSubCategory = '';
  let createdCount = 0;
  let updatedCount = 0;
  const importedItems = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rowType = pTypeIdx >= 0 && row[pTypeIdx] ? String(row[pTypeIdx]).trim() : '';
    const rowCat = catIdx >= 0 && row[catIdx] ? String(row[catIdx]).trim() : '';
    const rowSubCat = subCatIdx >= 0 && row[subCatIdx] ? String(row[subCatIdx]).trim() : '';
    const rowName = nameIdx >= 0 && row[nameIdx] ? String(row[nameIdx]).trim() : '';

    if (rowType) curType = rowType;
    if (rowCat) curCategory = rowCat;
    if (rowSubCat) curSubCategory = rowSubCat;

    if (!rowName || rowName.startsWith('---') || rowName.replace(/-/g, '').length === 0) {
      continue;
    }

    const totalP = totalIdx >= 0 ? parseInt(row[totalIdx]) || 0 : 0;

    const cleanSubCat = (curSubCategory && !curSubCategory.startsWith('---')) ? curSubCategory : '';
    const cleanCategory = curCategory.trim();
    const cleanName = rowName.replace(/-{3,}/g, ' - ').trim();

    // Parent Type Category (Shirts, T-Shirts, etc.)
    const parentCat = await getOrCreateCategory(curType, null);

    // Sub Category (e.g. Boxy-fit Shirts, Fleece Henley)
    const subCat = await getOrCreateCategory(cleanCategory, parentCat ? parentCat._id : null);

    // Minor child subCategory if present (e.g. Check Design, Plain Design, Gucci)
    let childSubCat = null;
    if (cleanSubCat) {
      childSubCat = await getOrCreateCategory(cleanSubCat, subCat ? subCat._id : null);
    }

    // Determine prices
    const isShirt = curType.toLowerCase().includes('shirt') && !curType.toLowerCase().includes('t-shirt');
    let sellPrice = sellIdx >= 0 && parseFloat(row[sellIdx]) ? parseFloat(row[sellIdx]) : (isShirt ? 999 : 699);
    let costPrice = costIdx >= 0 && parseFloat(row[costIdx]) ? parseFloat(row[costIdx]) : (isShirt ? 1999 : 1399);
    if (costPrice < sellPrice) costPrice = Math.round(sellPrice * 1.8);
    const discount = Math.round(((costPrice - sellPrice) / costPrice) * 100);

    // Images
    let images = [];
    if (imageIdx >= 0 && row[imageIdx]) {
      const splitImgs = String(row[imageIdx])
        .split(/[\n,;]+/)
        .map(formatImageUrl)
        .filter(Boolean);
      if (splitImgs.length > 0) images = splitImgs;
    }
    if (images.length === 0) {
      const pool = isShirt ? SHIRT_IMAGES : TSHIRT_IMAGES;
      images = [pool[(createdCount + updatedCount) % pool.length]];
    }

    // Build standard readable title
    let displayTitle = '';
    const formattedItemName = titleCase(cleanName);
    if (cleanSubCat) {
      displayTitle = `${titleCase(cleanCategory)} (${titleCase(cleanSubCat)}) - ${formattedItemName}`;
    } else {
      displayTitle = `${titleCase(cleanCategory)} - ${formattedItemName}`;
    }

    let baseSlug = slugify(displayTitle);
    if (!baseSlug) baseSlug = `product-${createdCount + updatedCount + 1}`;

    // Variants dynamically from all detected size columns (XS, S, M, L, XL, XXL, 3XL, Free Size, etc.)
    const variants = [];
    for (const sc of detectedSizeColumns) {
      const count = sc.idx >= 0 ? parseInt(row[sc.idx]) || 0 : 0;
      if (count > 0) {
        variants.push({ size: sc.label, stock: count, price: sellPrice });
      }
    }

    // If no size counts were found in columns, check if a list was given in Size / Available Sizes column
    if (variants.length === 0 && sizeListIdx >= 0 && row[sizeListIdx]) {
      const rawSizes = String(row[sizeListIdx]).split(/[,/ ]+/).map((s) => s.trim()).filter(Boolean);
      const piecePerSize = Math.max(1, Math.floor((totalP || 1) / (rawSizes.length || 1)));
      for (const s of rawSizes) {
        const formatted = KNOWN_SIZE_MAP[s.toLowerCase()] || s.toUpperCase();
        variants.push({ size: formatted, stock: piecePerSize, price: sellPrice });
      }
    }

    // Fallback if still empty
    if (variants.length === 0) {
      variants.push({ size: 'M', stock: Math.max(1, totalP), price: sellPrice });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const customDesc = descIdx >= 0 && row[descIdx] ? String(row[descIdx]).trim() : '';
    const customFabric = fabricIdx >= 0 && row[fabricIdx] ? String(row[fabricIdx]).trim() : '';
    const customFit = fitIdx >= 0 && row[fitIdx] ? String(row[fitIdx]).trim() : '';
    const customBrand = brandIdx >= 0 && row[brandIdx] ? String(row[brandIdx]).trim() : 'AMAYAAR';

    let product = await Product.findOne({
      $or: [{ slug: baseSlug }, { name: displayTitle }],
    });

    if (product) {
      product.name = displayTitle;
      product.price = sellPrice;
      product.mrp = costPrice;
      product.discount = discount;
      product.stock = totalStock;
      product.variants = variants;
      product.category = subCat ? subCat._id : null;
      product.subCategory = childSubCat ? childSubCat._id : null;
      if (imageIdx >= 0 && row[imageIdx] && images.length > 0) {
        product.images = images;
      }
      if (customDesc) product.description = customDesc;
      if (customFabric) product.fabric = customFabric;
      if (customFit) product.fit = customFit;
      if (customBrand) product.brand = customBrand;
      product.isActive = true;
      await product.save();
      updatedCount++;
      importedItems.push({ id: product._id, name: product.name, status: 'updated' });
    } else {
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const newProduct = await Product.create({
        name: displayTitle,
        slug: uniqueSlug,
        brand: customBrand || 'AMAYAAR',
        category: subCat ? subCat._id : null,
        subCategory: childSubCat ? childSubCat._id : null,
        description:
          customDesc ||
          `Premium ${titleCase(cleanCategory)} in signature ${formattedItemName}. Designed with high-density fabric, precision tailoring, and modern streetwear aesthetic.`,
        price: sellPrice,
        mrp: costPrice,
        discount,
        stock: totalStock,
        variants,
        images,
        fabric: customFabric || (isShirt ? '100% Premium Cotton' : 'Heavyweight Cotton / Fleece Waffle'),
        fit: customFit || 'Boxy / Oversized Streetwear Fit',
        isActive: true,
        rating: 4.8,
      });
      createdCount++;
      importedItems.push({ id: newProduct._id, name: newProduct.name, status: 'created' });
    }
  }

  return {
    totalProcessed: createdCount + updatedCount,
    createdCount,
    updatedCount,
    sample: importedItems.slice(0, 5),
  };
}

module.exports = {
  bulkImportProductsFromBuffer,
};
