const EditorialLook = require('./editorialLook.model');

const DEFAULT_LOOKS = [
  {
    title: 'JACKET 01',
    subtitle: 'ORANGE PUFFER DROP',
    tag: 'FALL / WINTER',
    season: '2026 EDITION',
    drop: 'DROP 01',
    status: 'IN STOCK',
    category1: 'NOCTA PUFFER',
    category2: 'THERMAL INSULATION',
    image: '/editorial-looks/nocta_look1.png',
    fallback: '/editorial-looks/nocta_look1.png',
    gradient: 'from-[#ff8800]/10 via-neutral-100 to-white',
    isCutout: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'JACKET 02',
    subtitle: 'TACTICAL MATRIX UTILITY',
    tag: 'LIMITED RUN',
    season: 'STREET COUTURE',
    drop: 'DROP 02',
    status: 'IN STOCK',
    category1: 'TACTICAL UTILITY',
    category2: 'CARGO LAYER',
    image: '/editorial-looks/look2-tactical-matrix.png',
    fallback: '/editorial-looks/look2-tactical-matrix.png',
    gradient: 'from-neutral-200 via-neutral-100 to-white',
    isCutout: true,
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'JACKET 03',
    subtitle: 'RAW VINTAGE FIT',
    tag: 'TIMELESS CUT',
    season: '2026 EDITION',
    drop: 'EXCLUSIVE',
    status: 'LIMITED RUN',
    category1: 'BAGGY DENIM',
    category2: 'ACID WASH FLEECE',
    image: '/editorial-looks/look3-raw-vintage.png',
    fallback: '/editorial-looks/look3-raw-vintage.png',
    gradient: 'from-neutral-200 via-neutral-100 to-white',
    isCutout: true,
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'JACKET 04',
    subtitle: 'STEALTH PUFFER BOMBER',
    tag: 'CORE ESSENTIAL',
    season: 'FALL / WINTER',
    drop: 'DROP 04',
    status: 'SELLING FAST',
    category1: 'STEALTH BOMBER',
    category2: 'ALL-WEATHER SHELL',
    image: '/editorial-looks/nocta_look4.png',
    fallback: '/editorial-looks/nocta_look4.png',
    gradient: 'from-neutral-300 via-neutral-100 to-white',
    isCutout: true,
    displayOrder: 4,
    isActive: true,
  },
  {
    title: 'JACKET 05',
    subtitle: 'BOXY UTILITY OVERSHIRT',
    tag: 'AVANT-GARDE',
    season: '2026 EDITION',
    drop: 'CYBER DROP',
    status: 'NEW ARRIVAL',
    category1: 'UTILITY OVERSHIRT',
    category2: 'TECHNICAL CARGO',
    image: '/editorial-looks/look5-boxy-utility.png',
    fallback: '/editorial-looks/look5-boxy-utility.png',
    gradient: 'from-neutral-200 via-neutral-100 to-white',
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
