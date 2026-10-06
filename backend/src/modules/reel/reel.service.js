const { Reel, ReelSetting } = require('./reel.model');

async function getReelSettings() {
  let settings = await ReelSetting.findOne({ key: 'default' });
  if (!settings) {
    settings = await ReelSetting.create({ key: 'default', displayCount: 4 });
  }
  return settings;
}

async function updateReelSettings(displayCount) {
  const count = Number(displayCount) === 5 ? 5 : 4;
  let settings = await ReelSetting.findOneAndUpdate(
    { key: 'default' },
    { displayCount: count },
    { new: true, upsert: true }
  );
  return settings;
}

async function getActiveReels() {
  const reels = await Reel.find({ isActive: true }).populate('product').populate('product2').sort({ displayOrder: 1, createdAt: -1 });
  const settings = await getReelSettings();
  return { reels, displayCount: settings.displayCount };
}

async function getAllReels() {
  const reels = await Reel.find().populate('product').populate('product2').sort({ displayOrder: 1, createdAt: -1 });
  const settings = await getReelSettings();
  return { reels, displayCount: settings.displayCount };
}

async function createReel(data) {
  return Reel.create(data);
}

async function updateReel(id, data) {
  return Reel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteReel(id) {
  return Reel.findByIdAndDelete(id);
}

module.exports = {
  getReelSettings,
  updateReelSettings,
  getActiveReels,
  getAllReels,
  createReel,
  updateReel,
  deleteReel,
};
