const mongoose = require('mongoose');
const env = require('../src/config/env');
const Product = require('../src/modules/product/product.model');
const Category = require('../src/modules/category/category.model');

// High quality curated streetwear apparel images mapped by color and garment style
const COLOR_IMAGE_MAP = {
  // Shirts
  'checks_black_maroon': [
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  ],
  'checks_dark_grey': [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
  ],
  'checks_grey_brown': [
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
  ],
  'checks_blue': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  ],
  'checks_mustard': [
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
  ],
  'checks_teal': [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
  ],
  'checks_white_black': [
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
  ],
  'plain_black': [
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  ],
  'plain_white': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
  ],
  'plain_beige': [
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  ],
  'plain_brown': [
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  ],
  'plain_olive': [
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80',
  ],
  'plain_navy': [
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  ],
  'plain_rust': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80',
  ],
  'striped_blue': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  ],
  'striped_pink': [
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  ],
  // T-Shirts (Henley, Polo, Riders, Waffle)
  'henley': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
  ],
  'polo': [
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  ],
  'riders': [
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
  ],
  'waffle': [
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
  ],
  'default_tee': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
  ],
};

function getImagesForProduct(category, subCategory, designOrBrand, rawName) {
  const nameLower = rawName.toLowerCase();
  const subLower = subCategory.toLowerCase();

  if (category === 'Shirts') {
    if (nameLower.includes('check') || designOrBrand.includes('Check')) {
      if (nameLower.includes('maroon') || nameLower.includes('marron')) return COLOR_IMAGE_MAP.checks_black_maroon;
      if (nameLower.includes('dark grey')) return COLOR_IMAGE_MAP.checks_dark_grey;
      if (nameLower.includes('grey with brown')) return COLOR_IMAGE_MAP.checks_grey_brown;
      if (nameLower.includes('blue')) return COLOR_IMAGE_MAP.checks_blue;
      if (nameLower.includes('mustard')) return COLOR_IMAGE_MAP.checks_mustard;
      if (nameLower.includes('teal')) return COLOR_IMAGE_MAP.checks_teal;
      if (nameLower.includes('white with black')) return COLOR_IMAGE_MAP.checks_white_black;
      return COLOR_IMAGE_MAP.checks_grey_brown;
    }
    if (subLower.includes('strip')) {
      if (nameLower.includes('pink')) return COLOR_IMAGE_MAP.striped_pink;
      return COLOR_IMAGE_MAP.striped_blue;
    }
    if (nameLower.includes('black')) return COLOR_IMAGE_MAP.plain_black;
    if (nameLower.includes('white') || nameLower.includes('cream')) return COLOR_IMAGE_MAP.plain_white;
    if (nameLower.includes('beige')) return COLOR_IMAGE_MAP.plain_beige;
    if (nameLower.includes('brown')) return COLOR_IMAGE_MAP.plain_brown;
    if (nameLower.includes('olive')) return COLOR_IMAGE_MAP.plain_olive;
    if (nameLower.includes('navy')) return COLOR_IMAGE_MAP.plain_navy;
    if (nameLower.includes('rust')) return COLOR_IMAGE_MAP.plain_rust;
    return COLOR_IMAGE_MAP.plain_beige;
  }

  // T-Shirts
  if (subLower.includes('henley')) return COLOR_IMAGE_MAP.henley;
  if (subLower.includes('polo')) return COLOR_IMAGE_MAP.polo;
  if (subLower.includes('rider')) return COLOR_IMAGE_MAP.riders;
  if (subLower.includes('waffle')) return COLOR_IMAGE_MAP.waffle;

  return COLOR_IMAGE_MAP.default_tee;
}

function cleanTitle(category, subCategory, designOrBrand, rawName) {
  // Format graphic tag if present
  let baseName = rawName.replace(/---+/g, ' - ').replace(/\s+/g, ' ').trim();

  // Convert ALL CAPS to Title Case for better readability
  baseName = baseName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  // Correct abbreviations
  baseName = baseName
    .replace(/\bGfx\b/g, 'GFX')
    .replace(/\bMarron\b/g, 'Maroon')
    .replace(/\bSlaty\b/g, 'Slate')
    .replace(/\bT-shirts\b/g, 'T-Shirt')
    .replace(/\bShirts\b/g, 'Shirt');

  let prefix = '';
  if (subCategory.includes('BOXY-FIT') || subCategory.includes('Boxy')) {
    prefix = designOrBrand.includes('Check') ? 'Boxy-Fit Check Shirt' : 'Boxy-Fit Plain Shirt';
  } else if (subCategory.includes('PATTERN')) {
    prefix = 'Pattern Streetwear Shirt';
  } else if (subCategory.includes('PLAIN')) {
    prefix = 'Plain Minimalist Shirt';
  } else if (subCategory.includes('STRIP')) {
    prefix = 'Striped Casual Shirt';
  } else if (subCategory.includes('henley')) {
    prefix = 'Thermal Fleece Henley T-Shirt';
  } else if (subCategory.includes('Polo')) {
    prefix = `Polo T-Shirt (${designOrBrand || 'Classic'} Edition)`;
  } else if (subCategory.includes('Riders')) {
    prefix = 'Riders Streetwear T-Shirt';
  } else if (subCategory.includes('Waffle')) {
    prefix = 'Heavyweight Waffle Knit T-Shirt';
  } else {
    prefix = category ? `${category} Streetwear` : 'AMA YAAR Streetwear';
  }

  return `${prefix} - ${baseName}`;
}

const RAW_CSV_DATA = `,Shirts,BOXY-FIT Shirts,Check Design,BLACK WITH MARRON RED WHITE CHECKS,0,1,0,0,,,,,1,,
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

async function seed() {
  console.log('Connecting to MongoDB database (prodv3)...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected to:', mongoose.connection.name);

  // 1. Create or ensure Categories exist
  console.log('\n--- Ensuring Categories & Sub-Categories ---');
  
  // Root Categories
  const catShirts = await Category.findOneAndUpdate(
    { slug: 'shirts' },
    { name: 'Shirts', slug: 'shirts', parent: null, isActive: true, image: '/home img/Aamyaar (1).png' },
    { upsert: true, new: true }
  );
  const catTShirts = await Category.findOneAndUpdate(
    { slug: 't-shirts' },
    { name: 'T-Shirts', slug: 't-shirts', parent: null, isActive: true, image: '/home img/Aamyaar (2).png' },
    { upsert: true, new: true }
  );

  // Subcategories under Shirts
  const subBoxyFit = await Category.findOneAndUpdate(
    { slug: 'boxy-fit-shirts' },
    { name: 'Boxy-Fit Shirts', slug: 'boxy-fit-shirts', parent: catShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subPatternShirts = await Category.findOneAndUpdate(
    { slug: 'pattern-shirts' },
    { name: 'Pattern Shirts', slug: 'pattern-shirts', parent: catShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subPlainShirts = await Category.findOneAndUpdate(
    { slug: 'plain-shirts' },
    { name: 'Plain Shirts', slug: 'plain-shirts', parent: catShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subStripeShirts = await Category.findOneAndUpdate(
    { slug: 'stripe-shirts' },
    { name: 'Stripe Shirts', slug: 'stripe-shirts', parent: catShirts._id, isActive: true },
    { upsert: true, new: true }
  );

  // Sub-sub categories under Boxy-Fit
  const subCheckDesign = await Category.findOneAndUpdate(
    { slug: 'boxy-fit-check-design' },
    { name: 'Check Design Boxy Shirts', slug: 'boxy-fit-check-design', parent: subBoxyFit._id, isActive: true },
    { upsert: true, new: true }
  );
  const subPlainDesign = await Category.findOneAndUpdate(
    { slug: 'boxy-fit-plain-design' },
    { name: 'Plain Design Boxy Shirts', slug: 'boxy-fit-plain-design', parent: subBoxyFit._id, isActive: true },
    { upsert: true, new: true }
  );

  // Subcategories under T-Shirts
  const subFleeceHenley = await Category.findOneAndUpdate(
    { slug: 'fleece-henley' },
    { name: 'Fleece Henley', slug: 'fleece-henley', parent: catTShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subPoloTShirts = await Category.findOneAndUpdate(
    { slug: 'polo-t-shirts' },
    { name: 'Polo T-Shirts', slug: 'polo-t-shirts', parent: catTShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subRiders = await Category.findOneAndUpdate(
    { slug: 'riders' },
    { name: 'Riders T-Shirts', slug: 'riders', parent: catTShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subWaffle = await Category.findOneAndUpdate(
    { slug: 'waffle' },
    { name: 'Waffle T-Shirts', slug: 'waffle', parent: catTShirts._id, isActive: true },
    { upsert: true, new: true }
  );

  // Subcategories under Polo
  const subGucciPolo = await Category.findOneAndUpdate(
    { slug: 'polo-gucci-edition' },
    { name: 'Gucci Edition Polo', slug: 'polo-gucci-edition', parent: subPoloTShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subPumaPolo = await Category.findOneAndUpdate(
    { slug: 'polo-puma-edition' },
    { name: 'Puma Edition Polo', slug: 'polo-puma-edition', parent: subPoloTShirts._id, isActive: true },
    { upsert: true, new: true }
  );
  const subSportsPolo = await Category.findOneAndUpdate(
    { slug: 'polo-sports-edition' },
    { name: 'Sports Edition Polo', slug: 'polo-sports-edition', parent: subPoloTShirts._id, isActive: true },
    { upsert: true, new: true }
  );

  console.log('Categories & Sub-Categories created successfully!');

  // Category mapping helper
  function resolveCategories(cat, sub, design) {
    if (cat === 'Shirts') {
      if (sub.includes('BOXY-FIT') || sub.includes('Boxy')) {
        if (design.includes('Check')) return { category: catShirts._id, subCategory: subCheckDesign._id };
        if (design.includes('Plain')) return { category: catShirts._id, subCategory: subPlainDesign._id };
        return { category: catShirts._id, subCategory: subBoxyFit._id };
      }
      if (sub.includes('PATTERN')) return { category: catShirts._id, subCategory: subPatternShirts._id };
      if (sub.includes('PLAIN')) return { category: catShirts._id, subCategory: subPlainShirts._id };
      if (sub.includes('STRIP')) return { category: catShirts._id, subCategory: subStripeShirts._id };
      return { category: catShirts._id, subCategory: subBoxyFit._id };
    }

    if (cat === 'T-Shirts') {
      if (sub.includes('henley')) return { category: catTShirts._id, subCategory: subFleeceHenley._id };
      if (sub.includes('Polo')) {
        if (design.includes('Gucci')) return { category: catTShirts._id, subCategory: subGucciPolo._id };
        if (design.includes('Puma')) return { category: catTShirts._id, subCategory: subPumaPolo._id };
        if (design.includes('Sports')) return { category: catTShirts._id, subCategory: subSportsPolo._id };
        return { category: catTShirts._id, subCategory: subPoloTShirts._id };
      }
      if (sub.includes('Riders')) return { category: catTShirts._id, subCategory: subRiders._id };
      if (sub.includes('Waffle')) return { category: catTShirts._id, subCategory: subWaffle._id };
      return { category: catTShirts._id, subCategory: subWaffle._id };
    }

    return { category: catTShirts._id, subCategory: subWaffle._id };
  }

  // 2. Parse CSV
  const lines = RAW_CSV_DATA.split('\n').filter((l) => l.trim().length > 0);
  let currentMainCat = '';
  let currentSubCat = '';
  let currentDesign = '';

  const parsedItems = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    if (parts.every((p) => !p.trim())) continue;

    const colCat = parts[1]?.trim();
    const colSub = parts[2]?.trim();
    const colDes = parts[3]?.trim();
    const colName = parts[4]?.trim();

    if (colCat) currentMainCat = colCat;
    if (colSub) currentSubCat = colSub;
    if (colDes) {
      if (colDes.startsWith('---')) {
        currentDesign = '';
      } else {
        currentDesign = colDes;
      }
    }

    if (!colName || colName.startsWith('---')) continue;

    const small = parseInt(parts[5]?.trim() || '0') || 0;
    const medium = parseInt(parts[6]?.trim() || '0') || 0;
    const large = parseInt(parts[7]?.trim() || '0') || 0;
    const xl = parseInt(parts[8]?.trim() || '0') || 0;
    const total = parseInt(parts[13]?.trim() || '0') || small + medium + large + xl;

    parsedItems.push({
      category: currentMainCat,
      subCategory: currentSubCat,
      designOrBrand: currentDesign,
      rawName: colName,
      small,
      medium,
      large,
      xl,
      totalPieces: total,
    });
  }

  console.log(`\n--- Parsed ${parsedItems.length} Products from Inventory Data ---`);

  // Clear previous temporary seeded batch to avoid any duplicates or SKU collisions
  await Product.deleteMany({ sku: { $regex: /^AY-(SHI|T-S|TSH)-/ } });

  // 3. Mark old generic electronic/seed products as inactive or archived
  const oldUpdate = await Product.updateMany(
    { name: { $not: /Boxy-Fit|Thermal Fleece|Polo T-Shirt|Riders Streetwear|Waffle Knit|Pattern Streetwear|Plain Minimalist|Striped Casual/ } },
    { $set: { isActive: false, isFeatured: false } }
  );
  console.log(`Archived ${oldUpdate.modifiedCount} legacy/mock catalog products`);

  // 4. Upsert each of the 79 real inventory products
  let createdCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < parsedItems.length; idx++) {
    const item = parsedItems[idx];
    const title = cleanTitle(item.category, item.subCategory, item.designOrBrand, item.rawName);
    
    // Generate clean slug
    const slug = (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${idx + 1}`
    ).slice(0, 90);

    const { category, subCategory } = resolveCategories(item.category, item.subCategory, item.designOrBrand);

    // Pricing
    let price = 799;
    let mrp = 1599;
    if (item.category === 'Shirts') {
      price = 999;
      mrp = 1999;
    } else if (item.subCategory.includes('Polo')) {
      price = 899;
      mrp = 1799;
    }

    // Fabric & specs
    let fabric = '100% Combed Cotton';
    let gsm = '240 GSM Heavyweight';
    let fit = 'Oversized Streetwear Fit';
    let whatsOnPrint = 'Clean minimal aesthetic with premium reinforced stitching.';

    if (item.category === 'Shirts') {
      fabric = item.subCategory.includes('BOXY-FIT') ? '100% Cotton Poplin & Twill Weave' : 'Super-Combed Lightweight Cotton';
      gsm = '180-220 GSM';
      fit = 'Boxy Streetwear Fit with Dropped Shoulder';
    } else if (item.subCategory.includes('henley')) {
      fabric = 'Thermal Micro-Fleece Cotton Blend';
      gsm = '320 GSM Winter Weight';
      fit = 'Relaxed Henley Streetwear Fit';
    } else if (item.subCategory.includes('Polo')) {
      fabric = 'Double Pique Mercerized Cotton';
      gsm = '260 GSM Structured Knit';
      fit = 'Modern Tailored Streetwear Fit';
    } else if (item.subCategory.includes('Waffle')) {
      fabric = 'Honeycomb Thermal Waffle Knit Cotton';
      gsm = '280 GSM Textured Fabric';
      fit = 'Relaxed Dropped-Shoulder Fit';
    }

    if (item.rawName.includes('GFX')) {
      const gfxMatch = item.rawName.match(/([A-Za-z0-9 ]+ GFX)/);
      whatsOnPrint = `High-density silkscreen & puff print (${gfxMatch ? gfxMatch[1] : 'Graphic Print'}) with reinforced neck rib.`;
    }

    const images = getImagesForProduct(item.category, item.subCategory, item.designOrBrand, item.rawName);

    // Variants with exact inventory counts per size
    const skuBase = `AY-${item.category.slice(0, 3).toUpperCase()}-${idx + 101}`;
    const colorName = item.rawName.replace(/---+/g, ' ').replace(/\s+/g, ' ').trim();
    const variants = [
      { size: 'S', color: colorName, stock: item.small, price, sku: `${skuBase}-S` },
      { size: 'M', color: colorName, stock: item.medium, price, sku: `${skuBase}-M` },
      { size: 'L', color: colorName, stock: item.large, price, sku: `${skuBase}-L` },
      { size: 'XL', color: colorName, stock: item.xl, price, sku: `${skuBase}-XL` },
    ];

    const availableSizes = [];
    if (item.small > 0) availableSizes.push('S');
    if (item.medium > 0) availableSizes.push('M');
    if (item.large > 0) availableSizes.push('L');
    if (item.xl > 0) availableSizes.push('XL');

    const productDoc = {
      name: title,
      slug,
      brand: item.designOrBrand && !item.designOrBrand.includes('Design') ? item.designOrBrand : 'AMA YAAR',
      category,
      subCategory,
      description: `${title}. Engineered for everyday comfort and bold streetwear styling. Features heavyweight construction, custom ribbed details, and an authentic relaxed silhouette.`,
      shortDescription: `${item.subCategory} - ${colorName} with ${item.totalPieces} units in stock.`,
      detailedDescription: `Crafted specifically for the AMA YAAR contemporary menswear lineup. Designed with precision dropped shoulders and premium ${fabric} for maximum longevity and everyday versatility.`,
      price,
      mrp,
      discount: Math.round(((mrp - price) / mrp) * 100),
      stock: item.totalPieces,
      variants,
      images,
      sku: skuBase,
      fabric,
      gsm,
      fit,
      countryOfOrigin: 'India',
      washCare: 'Machine wash cold inside out with similar colors. Do not iron directly on graphics. Tumble dry low.',
      whatsOnPrint,
      stylingTip: 'Style with wide-leg relaxed denim, chunky sneakers, and a minimal beanie for peak streetwear aesthetics.',
      specifications: [
        { name: 'Category', value: item.category },
        { name: 'Collection', value: item.subCategory },
        { name: 'Color / Pattern', value: colorName },
        { name: 'Available Sizes', value: availableSizes.length > 0 ? availableSizes.join(', ') : 'M, L, XL' },
        { name: 'Total Physical Stock', value: `${item.totalPieces} pieces` },
      ],
      highlights: [
        `Authentic ${item.subCategory} piece`,
        `${fabric} with ${gsm}`,
        `Comfortable ${fit}`,
        `Available in sizes: ${availableSizes.length > 0 ? availableSizes.join(', ') : 'All sizes'}`,
      ],
      keyFeatures: [
        'Reinforced double-needle collar and seams',
        'Pre-shrunk fabric to minimize shrinkage',
        'True-to-size relaxed boxy streetwear drop',
      ],
      tags: [
        item.category.toLowerCase(),
        item.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        'streetwear',
        'new-drop',
        'ama-yaar',
      ],
      rating: Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
      numReviews: 14 + (idx % 25),
      isFeatured: idx < 12,
      isNewArrival: idx < 20,
      isBestSeller: item.totalPieces >= 3,
      isActive: true,
    };

    const res = await Product.findOneAndUpdate(
      { sku: skuBase },
      { $set: productDoc },
      { upsert: true, new: true }
    );

    if (res.wasNew) createdCount++;
    else updatedCount++;
  }

  console.log(`\nSuccessfully processed products: Created/Updated ${parsedItems.length} products in prodv3!`);

  // Verify total active products in database
  const totalActive = await Product.countDocuments({ isActive: true });
  console.log(`\nTotal Active Products in prodv3: ${totalActive}`);

  const sample = await Product.find({ isActive: true }).select('name price stock variants').limit(3).lean();
  console.log('Sample newly seeded products:');
  sample.forEach(s => {
    console.log(` - ${s.name} (₹${s.price}, Stock: ${s.stock})`);
    console.log(`   Variants:`, s.variants.map(v => `${v.size}:${v.stock}`).join(' | '));
  });

  await mongoose.disconnect();
  console.log('\nDatabase sync complete!');
}

seed().catch((err) => {
  console.error('Error seeding prodv3 catalog:', err);
  process.exit(1);
});
