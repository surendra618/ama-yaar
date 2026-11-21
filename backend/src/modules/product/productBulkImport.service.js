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
  'free': 'Free Size',
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
  let skuIdx = -1;
  let costIdx = -1;
  let sellIdx = -1;
  let totalIdx = -1;
  let imageIdx = -1;
  let sizeListIdx = -1;
  let descIdx = -1;
  let detailedDescIdx = -1;
  let keyFeaturesIdx = -1;
  let fabricIdx = -1;
  let gsmIdx = -1;
  let fitIdx = -1;
  let brandIdx = -1;
  let countryIdx = -1;
  let washCareIdx = -1;
  let whatsOnPrintIdx = -1;
  let stylingTipIdx = -1;
  let modelInfoIdx = -1;
  let sizeChartTypeIdx = -1;
  let featuredIdx = -1;
  let activeIdx = -1;
  const detectedSizeColumns = [];

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r].map((cell) => String(cell || '').trim().toLowerCase());
    const rowStr = row.join(' ');
    if (
      rowStr.includes('product') ||
      rowStr.includes('category') ||
      rowStr.includes('price') ||
      rowStr.includes('sku') ||
      rowStr.includes('name') ||
      rowStr.includes('small')
    ) {
      headerRowIndex = r;
      row.forEach((col, idx) => {
        const c = col.toLowerCase().trim();
        const cleanKey = c.replace(/[^a-z0-9]/g, '');

        if (c.includes('product type') || (c.includes('type') && !c.includes('product name') && !c.includes('chart'))) {
          pTypeIdx = idx;
        } else if (c.includes('sub-category') || c.includes('sub category') || c.includes('subcategory')) {
          subCatIdx = idx;
        } else if (c.includes('category')) {
          catIdx = idx;
        } else if (c.includes('product name') || (c.includes('name') && !c.includes('brand')) || c.includes('title')) {
          nameIdx = idx;
        } else if (c.includes('sku') || c.includes('product id') || c.includes('item code') || cleanKey === 'sku' || cleanKey === 'id') {
          skuIdx = idx;
        } else if (KNOWN_SIZE_MAP[c] || KNOWN_SIZE_MAP[cleanKey]) {
          detectedSizeColumns.push({ label: KNOWN_SIZE_MAP[c] || KNOWN_SIZE_MAP[cleanKey], idx });
        } else if (c === 'size' || c === 'sizes' || c.includes('size in') || c.includes('available size')) {
          sizeListIdx = idx;
        } else if (c.includes('cost') || c.includes('mrp')) {
          costIdx = idx;
        } else if (c.includes('selling') || c === 'price' || c.includes('price (₹)') || c.includes('selling price')) {
          sellIdx = idx;
        } else if (c.includes('total') || c.includes('stock') || c.includes('qty') || c.includes('pieces')) {
          totalIdx = idx;
        } else if (c.includes('image') || c.includes('photo') || c.includes('img') || c.includes('picture') || c.includes('url')) {
          imageIdx = idx;
        } else if (c.includes('detailed desc') || c.includes('detailed description') || c.includes('story') || c.includes('long desc')) {
          detailedDescIdx = idx;
        } else if (c.includes('desc') || c.includes('about')) {
          descIdx = idx;
        } else if (c.includes('feature') || c.includes('highlight') || c.includes('bullet')) {
          keyFeaturesIdx = idx;
        } else if (c.includes('fabric') || c.includes('material')) {
          fabricIdx = idx;
        } else if (c.includes('gsm')) {
          gsmIdx = idx;
        } else if (c.includes('fit') || c.includes('silhouette')) {
          fitIdx = idx;
        } else if (c.includes('brand')) {
          brandIdx = idx;
        } else if (c.includes('origin') || c.includes('country')) {
          countryIdx = idx;
        } else if (c.includes('wash') || c.includes('care')) {
          washCareIdx = idx;
        } else if (c.includes('print')) {
          whatsOnPrintIdx = idx;
        } else if (c.includes('styling') || c.includes('style tip')) {
          stylingTipIdx = idx;
        } else if (c.includes('model')) {
          modelInfoIdx = idx;
        } else if (c.includes('size chart') || c.includes('chart type')) {
          sizeChartTypeIdx = idx;
        } else if (c.includes('featured')) {
          featuredIdx = idx;
        } else if (c.includes('active') || c.includes('status')) {
          activeIdx = idx;
        }
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
    const cleanSubCat = curSubCategory && !curSubCategory.startsWith('---') ? curSubCategory.trim() : '';
    const cleanCategory = curCategory.trim();
    const cleanName = rowName.replace(/-{3,}/g, ' - ').trim();

    // Category hierarchy
    const parentCat = await getOrCreateCategory(curType, null);
    const subCat = await getOrCreateCategory(cleanCategory, parentCat ? parentCat._id : null);
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

    // Parse image URLs (supports multiple URLs separated by comma, pipe, newline, semicolon)
    let images = [];
    if (imageIdx >= 0 && row[imageIdx]) {
      const splitImgs = String(row[imageIdx])
        .split(/[\n,;|]+/)
        .map((s) => s.trim())
        .map(formatImageUrl)
        .filter(Boolean);
      if (splitImgs.length > 0) images = splitImgs;
    }
    if (images.length === 0) {
      const pool = isShirt ? SHIRT_IMAGES : TSHIRT_IMAGES;
      images = [pool[(createdCount + updatedCount) % pool.length]];
    }

    // Product Title
    const formattedItemName = titleCase(cleanName);
    let displayTitle = formattedItemName;
    const lowerCleanName = cleanName.toLowerCase();
    const lowerCat = cleanCategory.toLowerCase();

    // Only prepend category prefix if the item name is very short or doesn't mention apparel category
    if (
      cleanCategory &&
      cleanName.length < 20 &&
      !lowerCleanName.includes(lowerCat) &&
      !lowerCleanName.includes('shirt') &&
      !lowerCleanName.includes('tee') &&
      !lowerCleanName.includes('pant') &&
      !lowerCleanName.includes('cargo') &&
      !lowerCleanName.includes('hoodie')
    ) {
      if (cleanSubCat) {
        displayTitle = `${titleCase(cleanCategory)} (${titleCase(cleanSubCat)}) - ${formattedItemName}`;
      } else {
        displayTitle = `${titleCase(cleanCategory)} - ${formattedItemName}`;
      }
    }

    let baseSlug = slugify(displayTitle);
    if (!baseSlug) baseSlug = `product-${createdCount + updatedCount + 1}`;

    // SKU
    const customSku = skuIdx >= 0 && row[skuIdx] ? String(row[skuIdx]).trim().toUpperCase() : '';

    // Variants dynamically from all detected size columns (XS, S, M, L, XL, XXL, 3XL, Free Size, etc.)
    const variants = [];
    for (const sc of detectedSizeColumns) {
      const count = sc.idx >= 0 ? parseInt(row[sc.idx]) || 0 : 0;
      if (count > 0) {
        variants.push({
          size: sc.label,
          stock: count,
          price: sellPrice,
          sku: customSku ? `${customSku}-${sc.label}` : '',
        });
      }
    }

    // If no size counts were found in columns, check if a list was given in Size / Available Sizes column
    if (variants.length === 0 && sizeListIdx >= 0 && row[sizeListIdx]) {
      const rawSizes = String(row[sizeListIdx]).split(/[,/ ]+/).map((s) => s.trim()).filter(Boolean);
      const piecePerSize = Math.max(1, Math.floor((totalP || 1) / (rawSizes.length || 1)));
      for (const s of rawSizes) {
        const formatted = KNOWN_SIZE_MAP[s.toLowerCase()] || s.toUpperCase();
        variants.push({
          size: formatted,
          stock: piecePerSize,
          price: sellPrice,
          sku: customSku ? `${customSku}-${formatted}` : '',
        });
      }
    }

    // Fallback if still empty
    if (variants.length === 0) {
      variants.push({
        size: 'M',
        stock: Math.max(1, totalP),
        price: sellPrice,
        sku: customSku ? `${customSku}-M` : '',
      });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    // Extended product fields
    const customDesc = descIdx >= 0 && row[descIdx] ? String(row[descIdx]).trim() : '';
    const customDetailedDesc = detailedDescIdx >= 0 && row[detailedDescIdx] ? String(row[detailedDescIdx]).trim() : '';
    const customFabric = fabricIdx >= 0 && row[fabricIdx] ? String(row[fabricIdx]).trim() : '';
    const customGsm = gsmIdx >= 0 && row[gsmIdx] ? String(row[gsmIdx]).trim() : '';
    const customFit = fitIdx >= 0 && row[fitIdx] ? String(row[fitIdx]).trim() : '';
    const customBrand = brandIdx >= 0 && row[brandIdx] ? String(row[brandIdx]).trim() : 'AMAYAAR';
    const customCountry = countryIdx >= 0 && row[countryIdx] ? String(row[countryIdx]).trim() : 'India';
    const customWashCare = washCareIdx >= 0 && row[washCareIdx] ? String(row[washCareIdx]).trim() : '';
    const customWhatsOnPrint = whatsOnPrintIdx >= 0 && row[whatsOnPrintIdx] ? String(row[whatsOnPrintIdx]).trim() : '';
    const customStylingTip = stylingTipIdx >= 0 && row[stylingTipIdx] ? String(row[stylingTipIdx]).trim() : '';
    const customModelInfo = modelInfoIdx >= 0 && row[modelInfoIdx] ? String(row[modelInfoIdx]).trim() : '';

    let keyFeatures = [];
    if (keyFeaturesIdx >= 0 && row[keyFeaturesIdx]) {
      keyFeatures = String(row[keyFeaturesIdx])
        .split(/[|\n;]+/)
        .map((s) => s.trim().replace(/^[•\-\*\s]+/, ''))
        .filter(Boolean);
    }

    // Size chart type detection
    let sizeChartType = 'tops';
    if (sizeChartTypeIdx >= 0 && row[sizeChartTypeIdx]) {
      const rawChart = String(row[sizeChartTypeIdx]).trim().toLowerCase();
      if (rawChart.includes('bottom') || rawChart.includes('pant') || rawChart.includes('jean') || rawChart.includes('cargo') || rawChart.includes('trouser')) {
        sizeChartType = 'bottoms';
      } else if (rawChart.includes('top') || rawChart.includes('shirt') || rawChart.includes('tee') || rawChart.includes('hoodie')) {
        sizeChartType = 'tops';
      } else if (rawChart.includes('image')) {
        sizeChartType = 'image';
      }
    } else {
      if (
        curType.toLowerCase().includes('bottom') ||
        cleanCategory.toLowerCase().includes('cargo') ||
        cleanCategory.toLowerCase().includes('pant') ||
        cleanCategory.toLowerCase().includes('jean')
      ) {
        sizeChartType = 'bottoms';
      } else {
        sizeChartType = 'tops';
      }
    }

    // Flags
    let isFeatured = false;
    if (featuredIdx >= 0 && row[featuredIdx]) {
      const val = String(row[featuredIdx]).trim().toLowerCase();
      isFeatured = val === 'true' || val === 'yes' || val === '1' || val === 'y';
    }

    let isActive = true;
    if (activeIdx >= 0 && row[activeIdx] !== undefined && row[activeIdx] !== '') {
      const val = String(row[activeIdx]).trim().toLowerCase();
      isActive = val === 'true' || val === 'yes' || val === '1' || val === 'y' || val === 'active';
    }

    // Find existing product by SKU or Slug/Name
    let product = null;
    if (customSku) {
      product = await Product.findOne({ sku: customSku });
    }
    if (!product) {
      product = await Product.findOne({
        $or: [{ slug: baseSlug }, { name: displayTitle }],
      });
    }

    if (product) {
      product.name = displayTitle;
      if (customSku) product.sku = customSku;
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
      if (customDetailedDesc) product.detailedDescription = customDetailedDesc;
      if (keyFeatures.length > 0) {
        product.keyFeatures = keyFeatures;
        product.bulletFeatures = keyFeatures;
      }
      if (customFabric) product.fabric = customFabric;
      if (customGsm) product.gsm = customGsm;
      if (customFit) product.fit = customFit;
      if (customBrand) product.brand = customBrand;
      if (customCountry) product.countryOfOrigin = customCountry;
      if (customWashCare) product.washCare = customWashCare;
      if (customWhatsOnPrint) product.whatsOnPrint = customWhatsOnPrint;
      if (customStylingTip) product.stylingTip = customStylingTip;
      if (customModelInfo) product.modelInfo = customModelInfo;
      if (sizeChartType) product.sizeChartType = sizeChartType;
      if (featuredIdx >= 0) product.isFeatured = isFeatured;
      if (activeIdx >= 0) product.isActive = isActive;
      await product.save();
      updatedCount++;
      importedItems.push({ id: product._id, name: product.name, status: 'updated' });
    } else {
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const defaultFeatures = [
        `${customFabric || '100% Super Combed Cotton'}`,
        `${customFit || 'Oversized Streetwear Fit'}`,
        'High-Density Bio-Washed Fabric',
        'Reinforced Seams & Durable Stitching',
      ];

      const newProduct = await Product.create({
        name: displayTitle,
        slug: uniqueSlug,
        sku: customSku || '',
        brand: customBrand || 'AMAYAAR',
        category: subCat ? subCat._id : null,
        subCategory: childSubCat ? childSubCat._id : null,
        description:
          customDesc ||
          `Premium ${titleCase(cleanCategory)} in signature ${formattedItemName}. Designed with high-density fabric, precision tailoring, and modern streetwear aesthetic.`,
        detailedDescription: customDetailedDesc || '',
        keyFeatures: keyFeatures.length > 0 ? keyFeatures : defaultFeatures,
        bulletFeatures: keyFeatures.length > 0 ? keyFeatures : defaultFeatures,
        price: sellPrice,
        mrp: costPrice,
        discount,
        stock: totalStock,
        variants,
        images,
        fabric: customFabric || (isShirt ? '100% Premium Cotton' : 'Heavyweight Cotton / Fleece Waffle'),
        gsm: customGsm || (isShirt ? '180 GSM' : '280 GSM'),
        fit: customFit || 'Oversized Streetwear Fit',
        countryOfOrigin: customCountry || 'India',
        washCare: customWashCare || 'Machine wash cold inside out, tumble dry low, do not iron directly on print',
        whatsOnPrint: customWhatsOnPrint || 'Signature Streetwear Artwork',
        stylingTip: customStylingTip || 'Pair with relaxed cargo pants and chunky retro sneakers',
        modelInfo: customModelInfo || 'Model is 5\'10" (178 cm), 72 kg, wearing Size M',
        sizeChartType: sizeChartType || 'tops',
        isFeatured,
        isActive,
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

function generateSampleWorkbook(format = 'xlsx') {
  const wb = xlsx.utils.book_new();

  const headers = [
    'Product Name',
    'SKU / Product ID',
    'Brand',
    'Product Type',
    'Category',
    'Sub-Category',
    'Selling Price (₹)',
    'MRP (₹)',
    'Total Stock',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    'Free Size',
    'Image URLs',
    'Description',
    'Detailed Description',
    'Key Features',
    'Fabric',
    'GSM',
    'Fit',
    'Country of Origin',
    'Wash Care',
    'Whats on Print',
    'Styling Tip',
    'Model Info',
    'Size Chart Type',
    'Featured',
    'Active Status',
  ];

  const sampleRows = [
    [
      'Vintage Oversized Acid Wash Heavyweight Tee',
      'AY-TEE-001',
      'AMAYAAR',
      'T-Shirts',
      'Oversized T-Shirts',
      'Acid Wash',
      899,
      1799,
      35,
      3,
      7,
      12,
      8,
      5,
      0,
      0,
      0,
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800, https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
      'High-density vintage wash graphic streetwear t-shirt with relaxed dropped shoulders.',
      'Engineered from 280 GSM luxury combed cotton with custom stone-wash distress effect and double-needle collar ribbing.',
      '280 GSM Terry Cotton | Vintage Acid Mineral Wash | Drop Shoulder Fit | High Density Puff Print | Bio-Washed Pre-Shrunk',
      '100% Super Combed Terry Cotton',
      '280 GSM',
      'Oversized Streetwear Fit',
      'India',
      'Machine wash cold inside out, do not bleach, warm iron on reverse',
      'High-density Japanese typography & distressed Cyber-Street artwork',
      'Pair with wide-leg relaxed cargo pants and chunky skate sneakers',
      'Model is 5\'10" (178 cm), 72 kg, wearing Size M',
      'tops',
      'TRUE',
      'TRUE',
    ],
    [
      "Men's Cuban Collar Textured Linen Resort Shirt",
      'AY-SHT-102',
      'AMAYAAR',
      'Shirts',
      'Casual Shirts',
      'Cuban Collar',
      1299,
      2499,
      28,
      0,
      6,
      10,
      8,
      4,
      0,
      0,
      0,
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800, https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      'Textured breathable resort collar shirt crafted for summer layering and effortless style.',
      'Woven with fine textured linen-cotton blend featuring relaxed open camp collar and shell buttons.',
      'Breathable Linen-Cotton Weave | Camp Cuban Collar | Side Hem Slits | Natural Coconut Shell Buttons',
      '60% Cotton, 40% Linen',
      '180 GSM',
      'Relaxed Boxy Fit',
      'India',
      'Hand wash cold or gentle cycle, line dry in shade, warm iron',
      'Solid Textured Slub Weave',
      'Layer open over a ribbed white tank top with tailored linen shorts',
      'Model is 6\'0" (183 cm), 75 kg, wearing Size L',
      'tops',
      'TRUE',
      'TRUE',
    ],
    [
      'Heavyweight Utility Multi-Pocket Cargo Parachute Pants',
      'AY-CAR-301',
      'AMAYAAR',
      'Bottoms',
      'Cargo Pants',
      'Parachute Pants',
      1799,
      3499,
      20,
      0,
      4,
      8,
      6,
      2,
      0,
      0,
      0,
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800',
      'Multi-pocket tactical cargo trousers with adjustable bungee drawcords at hems.',
      'Heavy duty ripstop cotton with articulated knee darts, 6 functional cargo pockets, and elasticated waist.',
      'Durable Cotton Ripstop | 6 Tactical Utility Pockets | Bungee Cinch Hems | Key D-Ring Loop',
      '100% Cotton Ripstop',
      '320 GSM',
      'Baggy Parachute Fit',
      'India',
      'Machine wash cold inside out with similar colors',
      'Minimalist tonal brand embroidery on cargo flap',
      'Pair with an oversized hoodie and retro runner sneakers',
      'Model is 5\'11" (180 cm), 70 kg, wearing Size M',
      'bottoms',
      'FALSE',
      'TRUE',
    ],
    [
      'Thermal Waffle Knit Heavyweight Fleece Pullover',
      'AY-HOD-405',
      'AMAYAAR',
      'Hoodies & Sweats',
      'Pullovers',
      'Thermal Fleece',
      1499,
      2999,
      24,
      2,
      6,
      8,
      6,
      2,
      0,
      0,
      0,
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      'Cozy heavyweight waffle textured thermal fleece pullover with dropped shoulders.',
      'Heavy-knit thermal fabric with soft brushed interior, ribbed cuffs, and minimal aesthetic.',
      '340 GSM Thermal Waffle Knit | Brushed Fleece Lining | Ribbed Collar & Cuffs | Relaxed Drop-Shoulder Silhouette',
      '80% Cotton, 20% Polyester',
      '340 GSM',
      'Relaxed Streetwear Fit',
      'India',
      'Machine wash gentle in cold water, do not tumble dry, dry flat',
      'Tonal high-density chest logo badge',
      'Wear with wide-leg distressed denim and chunky boots',
      'Model is 6\'1" (185 cm), 78 kg, wearing Size L',
      'tops',
      'TRUE',
      'TRUE',
    ],
  ];

  const ws = xlsx.utils.aoa_to_sheet([headers, ...sampleRows]);

  ws['!cols'] = [
    { wch: 38 }, // Product Name
    { wch: 18 }, // SKU
    { wch: 14 }, // Brand
    { wch: 18 }, // Product Type
    { wch: 22 }, // Category
    { wch: 20 }, // Sub-Category
    { wch: 18 }, // Selling Price
    { wch: 14 }, // MRP
    { wch: 14 }, // Total Stock
    { wch: 8 },  // XS
    { wch: 8 },  // S
    { wch: 8 },  // M
    { wch: 8 },  // L
    { wch: 8 },  // XL
    { wch: 8 },  // XXL
    { wch: 8 },  // 3XL
    { wch: 12 }, // Free Size
    { wch: 65 }, // Image URLs
    { wch: 45 }, // Description
    { wch: 50 }, // Detailed Description
    { wch: 50 }, // Key Features
    { wch: 30 }, // Fabric
    { wch: 12 }, // GSM
    { wch: 26 }, // Fit
    { wch: 18 }, // Country of Origin
    { wch: 38 }, // Wash Care
    { wch: 38 }, // Whats on Print
    { wch: 42 }, // Styling Tip
    { wch: 38 }, // Model Info
    { wch: 18 }, // Size Chart Type
    { wch: 12 }, // Featured
    { wch: 14 }, // Active Status
  ];

  xlsx.utils.book_append_sheet(wb, ws, 'Products Template');

  if (format === 'xlsx') {
    const instructions = [
      ['AMA YAAR - BULK PRODUCT IMPORT FIELD REFERENCE GUIDE'],
      ['Fill in your products in the "Products Template" sheet. Upload the saved .xlsx or .csv in the Admin portal.'],
      [''],
      ['Column Header', 'Requirement', 'Format & Guidance', 'Sample Value'],
      ['Product Name', 'Required', 'The title of your product as shown on storefront and cart.', 'Vintage Oversized Acid Wash Heavyweight Tee'],
      ['SKU / Product ID', 'Optional', 'Unique product code. If left blank, a unique SKU will be auto-generated.', 'AY-TEE-001'],
      ['Brand', 'Optional', 'Brand name. Defaults to AMAYAAR if omitted.', 'AMAYAAR'],
      ['Product Type', 'Recommended', 'High-level department (e.g. T-Shirts, Shirts, Bottoms, Hoodies).', 'T-Shirts'],
      ['Category', 'Recommended', 'Main catalog category (e.g. Oversized T-Shirts, Casual Shirts, Cargo Pants).', 'Oversized T-Shirts'],
      ['Sub-Category', 'Optional', 'Sub-collection or style group (e.g. Acid Wash, Cuban Collar, Parachute).', 'Acid Wash'],
      ['Selling Price (₹)', 'Required', 'Actual price customer pays (numbers only).', '899'],
      ['MRP (₹)', 'Required', 'Maximum retail price / printed price (used to calculate discount % tag).', '1799'],
      ['Total Stock', 'Optional', 'Total inventory pieces. Auto-calculated from size breakdown if omitted.', '35'],
      ['XS, S, M, L, XL, XXL, 3XL, Free Size', 'Recommended', 'Quantity available in stock for each respective size variant.', 'XS: 3, S: 7, M: 12, L: 8, XL: 5'],
      ['Image URLs', 'Required', 'Publicly accessible image web URLs. Separate multiple photos using a comma (,). Supports Cloudinary, Unsplash, Google Drive, and Dropbox.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800, https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'],
      ['Description', 'Optional', 'Storefront short overview displayed on product page.', 'High-density vintage wash graphic streetwear t-shirt with relaxed dropped shoulders.'],
      ['Detailed Description', 'Optional', 'Deep story and tailoring notes displayed under product description tab.', 'Engineered from 280 GSM luxury combed cotton with custom stone-wash distress effect.'],
      ['Key Features', 'Optional', 'List of highlight bullets separated by pipe (|) or comma.', '280 GSM Terry Cotton | Vintage Acid Wash | Drop Shoulder Fit | High Density Puff Print'],
      ['Fabric', 'Optional', 'Material composition (e.g. 100% Super Combed Terry Cotton).', '100% Super Combed Terry Cotton'],
      ['GSM', 'Optional', 'Fabric density / weight (e.g. 280 GSM).', '280 GSM'],
      ['Fit', 'Optional', 'Cut style (Oversized Streetwear Fit, Boxy Fit, Relaxed, Baggy).', 'Oversized Streetwear Fit'],
      ['Country of Origin', 'Optional', 'Country of manufacture.', 'India'],
      ['Wash Care', 'Optional', 'Care instructions (e.g. Machine wash cold, do not iron on print).', 'Machine wash cold inside out, warm iron on reverse'],
      ['Whats on Print', 'Optional', 'Print artwork, graphic details, and embroidery notes.', 'High-density Japanese typography & distressed Cyber-Street artwork'],
      ['Styling Tip', 'Optional', 'Outfit styling advice displayed to shoppers.', 'Pair with wide-leg relaxed cargo pants and chunky skate sneakers'],
      ['Model Info', 'Optional', 'Model height, weight, and size worn for size reference.', 'Model is 5\'10" (178 cm), 72 kg, wearing Size M'],
      ['Size Chart Type', 'Optional', 'Enter "tops" for shirts/tees/hoodies, "bottoms" for cargos/pants/jeans, or "default".', 'tops'],
      ['Featured', 'Optional', 'TRUE to show in Featured products sections, FALSE otherwise.', 'TRUE'],
      ['Active Status', 'Optional', 'TRUE for published / active on storefront, FALSE for draft / hidden.', 'TRUE'],
    ];

    const guideWs = xlsx.utils.aoa_to_sheet(instructions);
    guideWs['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 65 }, { wch: 45 }];
    xlsx.utils.book_append_sheet(wb, guideWs, 'Instructions & Field Guide');
  }

  if (format === 'csv') {
    return xlsx.utils.sheet_to_csv(ws);
  }

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  bulkImportProductsFromBuffer,
  generateSampleWorkbook,
};
