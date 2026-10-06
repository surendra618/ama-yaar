const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('./modules/category/category.model');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function seed20Children() {
  try {
    console.log('[seed20Children] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[seed20Children] Connected to MongoDB.');

    // Find or create Men root category
    let rootMen = await Category.findOne({ $or: [{ slug: 'fashion-men' }, { name: /men/i, parent: null }] });
    if (!rootMen) {
      rootMen = await Category.create({
        name: 'Men',
        slug: 'fashion-men',
        parent: null,
        image: 'https://images.unsplash.com/photo-1490578474895-699bc4e2cf59?w=600&q=80',
        isActive: true,
      });
      console.log('[seed20Children] Created Root Men category.');
    }

    // Find or create Alderway Labs root category
    let rootAlderway = await Category.findOne({ $or: [{ slug: 'alderway-labs' }, { name: /alderway/i, parent: null }] });
    if (!rootAlderway) {
      rootAlderway = await Category.create({
        name: 'Alderway Labs',
        slug: 'alderway-labs',
        parent: null,
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
        isActive: true,
      });
      console.log('[seed20Children] Created Root Alderway Labs category.');
    }

    // Find or create Accessories root category
    let rootAccessories = await Category.findOne({ $or: [{ slug: 'accessories' }, { name: /accessories/i, parent: null }] });
    if (!rootAccessories) {
      rootAccessories = await Category.create({
        name: 'Accessories & Street Gear',
        slug: 'accessories-street-gear',
        parent: null,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        isActive: true,
      });
      console.log('[seed20Children] Created Root Accessories category.');
    }

    // List of 20 Subcategories to add
    const childrenToSeed = [
      // 10 under Men
      { name: 'Oversized Printed Tees', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' },
      { name: 'Acid Wash Vintage Fits', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80' },
      { name: 'Heavyweight Hoodies & Sweats', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80' },
      { name: 'Street Parachute Cargos', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80' },
      { name: 'Relaxed Baggy Joggers', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80' },
      { name: 'Graphic Anime Back-Prints', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
      { name: 'Retro Varsity Jackets', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80' },
      { name: 'Heavy Drop-Shoulder Polos', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80' },
      { name: 'Casual Street Shorts', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80' },
      { name: 'Premium Co-ord Twin Sets', parent: rootMen._id, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },

      // 5 under Alderway Labs
      { name: 'Performance Gym Tanks', parent: rootAlderway._id, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80' },
      { name: 'Compression Activewear', parent: rootAlderway._id, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80' },
      { name: 'Seamless Workout Shorts', parent: rootAlderway._id, image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80' },
      { name: 'Thermal Training Hoodies', parent: rootAlderway._id, image: 'https://images.unsplash.com/photo-1510593081568-d01fb8154143?w=600&q=80' },
      { name: 'Dry-Fit Athletics', parent: rootAlderway._id, image: 'https://images.unsplash.com/photo-1483721061986-fc1008064972?w=600&q=80' },

      // 5 under Accessories & Street Gear
      { name: 'Streetwear Snapback Caps', parent: rootAccessories._id, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' },
      { name: 'Canvas Tote & Crossbody Bags', parent: rootAccessories._id, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' },
      { name: 'Heavy Stainless Chains', parent: rootAccessories._id, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80' },
      { name: 'Acid Dusted Socks', parent: rootAccessories._id, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80' },
      { name: 'Reflective Wristbands', parent: rootAccessories._id, image: 'https://images.unsplash.com/photo-1611591475777-233cd7a772b3?w=600&q=80' },
    ];

    let createdCount = 0;
    for (const child of childrenToSeed) {
      const slug = slugify(child.name);
      const existing = await Category.findOne({ slug });
      if (!existing) {
        await Category.create({
          name: child.name,
          slug,
          parent: child.parent,
          image: child.image,
          isActive: true,
        });
        createdCount++;
        console.log(`[seed20Children] Added subcategory: ${child.name}`);
      } else {
        // Update parent if missing
        if (!existing.parent) {
          existing.parent = child.parent;
          await existing.save();
        }
      }
    }

    console.log(`[seed20Children] Successfully seeded ${createdCount} child subcategories!`);
    process.exit(0);
  } catch (err) {
    console.error('[seed20Children] Error seeding children:', err);
    process.exit(1);
  }
}

seed20Children();
