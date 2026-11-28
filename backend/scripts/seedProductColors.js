const mongoose = require('mongoose');
const env = require('../src/config/env');
const Product = require('../src/modules/product/product.model');

const PALETTES = {
  denim: [
    { name: 'Vintage Indigo', hex: '#2b4c7e' },
    { name: 'Washed Black', hex: '#1c1c1e' },
    { name: 'Stone Grey', hex: '#6b7280' },
  ],
  apparel: [
    { name: 'Washed Black', hex: '#18181b' },
    { name: 'Olive Green', hex: '#3f6212' },
    { name: 'Off White', hex: '#eae6df' },
  ],
  footwear: [
    { name: 'Jet Black', hex: '#111111' },
    { name: 'Chalk White', hex: '#f3f4f6' },
    { name: 'Slate Grey', hex: '#475569' },
  ],
  accessories: [
    { name: 'Obsidian Black', hex: '#171717' },
    { name: 'Classic Tan', hex: '#92400e' },
    { name: 'Gunmetal Grey', hex: '#52525b' },
  ],
  default: [
    { name: 'Matte Black', hex: '#18181b' },
    { name: 'Silver Mist', hex: '#cbd5e1' },
    { name: 'Midnight Blue', hex: '#1e3a8a' },
  ],
};

function pickPalette(name = '') {
  const n = name.toLowerCase();
  if (n.includes('jean') || n.includes('denim') || n.includes('indigo')) return PALETTES.denim;
  if (
    n.includes('shirt') ||
    n.includes('tee') ||
    n.includes('polo') ||
    n.includes('hoodie') ||
    n.includes('jacket') ||
    n.includes('dress') ||
    n.includes('cargo') ||
    n.includes('trouser') ||
    n.includes('vest')
  ) {
    return PALETTES.apparel;
  }
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('boot') || n.includes('footwear')) {
    return PALETTES.footwear;
  }
  if (n.includes('watch') || n.includes('belt') || n.includes('bag') || n.includes('wallet')) {
    return PALETTES.accessories;
  }
  return PALETTES.default;
}

async function run() {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  const products = await Product.find({}).select('name images colorOptions').lean();

  let updatedCount = 0;
  for (const prod of products) {
    if (Array.isArray(prod.colorOptions) && prod.colorOptions.length > 0) continue;

    const imgs = Array.isArray(prod.images) ? prod.images.filter(Boolean) : [];
    const palette = pickPalette(prod.name);

    const colorOptions = palette.map((c, idx) => {
      let colorImgs = [];
      if (imgs.length > 0) {
        const primary = imgs[idx % imgs.length];
        const rest = imgs.filter((u) => u !== primary);
        colorImgs = [primary, ...rest];
      }
      return {
        name: c.name,
        hex: c.hex,
        images: colorImgs,
      };
    });

    await Product.updateOne({ _id: prod._id }, { $set: { colorOptions } });
    updatedCount += 1;
  }

  console.log(`Updated ${updatedCount} of ${products.length} products with colorOptions.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
