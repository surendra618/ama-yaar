const Banner = require('./banner.model');
const ApiError = require('../../utils/ApiError');

async function list(query = {}) {
  const { position, activeOnly = 'false' } = query;
  const filter = {};

  if (activeOnly === 'true') {
    filter.isActive = true;
    const now = new Date();
    filter.$or = [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ];
  }

  if (position) filter.position = position;

  return Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });
}

async function getById(id) {
  const doc = await Banner.findById(id);
  if (!doc) throw new ApiError(404, 'Banner not found');
  return doc;
}

async function create(data) {
  return Banner.create(data);
}

async function update(id, data) {
  const doc = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Banner not found');
  return doc;
}

async function remove(id) {
  const doc = await Banner.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Banner not found');
  return doc;
}

module.exports = { list, getById, create, update, remove };
