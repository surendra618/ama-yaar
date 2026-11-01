const EditorialLook = require('./editorialLook.model');

const DEFAULT_LOOKS = [
  {
    title: 'CARGO HIGH RIB',
    subtitle: 'JOGGER FIT',
    tag: 'FALL / WINTER',
    season: '2026 EDITION',
    drop: '2026 DROP',
    status: 'DELIVERY',
    category1: 'HOODIE',
    category2: 'SNEAKER',
    image: '/editorial-looks/look1-cargo-rib.png',
    fallback: '/editorial-looks/look1-cargo-rib.png',
    gradient: 'from-[#202125] via-[#3a3d44] to-[#bfc4c9]',
    isCutout: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'TACTICAL CAP & TANK',
    subtitle: 'STREET MATRIX',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'IN STOCK',
    category1: 'TACTICAL UTILITY',
    category2: 'CARGO',
    image: '/editorial-looks/look2-tactical-matrix.png',
    fallback: '/editorial-looks/look2-tactical-matrix.png',
    gradient: 'from-[#171d24] via-[#2d3946] to-[#b8c7d8]',
    isCutout: true,
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'RAW VINTAGE FIT',
    subtitle: 'OVERSIZED DRIP',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE',
    status: 'LIMITED RUN',
    category1: 'BAGGY DENIM',
    category2: 'ACID WASH TEE',
    image: '/editorial-looks/look3-raw-vintage.png',
    fallback: '/editorial-looks/look3-raw-vintage.png',
    gradient: 'from-[#28211b] via-[#483a2f] to-[#d4c6b8]',
    isCutout: true,
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'GRAPHIC EAGLE TEE',
    subtitle: 'HEAVYWEIGHT COTTON',
    tag: 'CORE ESSENTIAL',
    season: 'SPRING / SUMMER',
    drop: 'SPECIAL DROP',
    status: 'SELLING FAST',
    category1: 'IVORY POLO',
    category2: 'TAILORED TROUSERS',
    image: '/editorial-looks/look4-ivory-polo.png',
    fallback: '/editorial-looks/look4-ivory-polo.png',
    gradient: 'from-[#211624] via-[#3d2744] to-[#cbbece]',
    isCutout: true,
    displayOrder: 4,
    isActive: true,
  },
  {
    title: 'BOXY POLO SHIRT',
    subtitle: 'SUMMER EDITION',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    category1: 'UTILITY OVERSHIRT',
    category2: 'TECHNICAL CARGO',
    image: '/editorial-looks/look5-boxy-utility.png',
    fallback: '/editorial-looks/look5-boxy-utility.png',
    gradient: 'from-[#17211f] via-[#2c3d39] to-[#bed3cd]',
    isCutout: true,
    displayOrder: 5,
    isActive: true,
  },
];

async function seedIfEmpty() {
  const count = await EditorialLook.countDocuments();
  if (count === 0) {
    await EditorialLook.insertMany(DEFAULT_LOOKS);
  }
}

async function getActiveLooks() {
  await seedIfEmpty();
  return EditorialLook.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
}

async function getAllLooks() {
  await seedIfEmpty();
  return EditorialLook.find().sort({ displayOrder: 1, createdAt: -1 });
}

async function createLook(data) {
  return EditorialLook.create(data);
}

async function updateLook(id, data) {
  return EditorialLook.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteLook(id) {
  return EditorialLook.findByIdAndDelete(id);
}

module.exports = {
  getActiveLooks,
  getAllLooks,
  createLook,
  updateLook,
  deleteLook,
};
