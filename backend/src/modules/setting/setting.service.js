const Setting = require('./setting.model');

async function getDeliverySettings() {
  let doc = await Setting.findOne({ key: 'delivery' });
  if (!doc) {
    doc = await Setting.create({
      key: 'delivery',
      deliveryCharge: 49,
      freeDeliveryThreshold: 500,
      isFreeDeliveryEnabled: true,
      isDeliveryFeeActive: true,
      estimatedDeliveryDays: '2-4 business days',
    });
  }
  return doc;
}

async function updateDeliverySettings(data = {}) {
  const update = {};
  if (data.deliveryCharge !== undefined) update.deliveryCharge = Math.max(0, Number(data.deliveryCharge));
  if (data.freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = Math.max(0, Number(data.freeDeliveryThreshold));
  if (data.isFreeDeliveryEnabled !== undefined) update.isFreeDeliveryEnabled = Boolean(data.isFreeDeliveryEnabled);
  if (data.isDeliveryFeeActive !== undefined) update.isDeliveryFeeActive = Boolean(data.isDeliveryFeeActive);
  if (data.estimatedDeliveryDays !== undefined) update.estimatedDeliveryDays = String(data.estimatedDeliveryDays).trim();

  const doc = await Setting.findOneAndUpdate(
    { key: 'delivery' },
    { $set: update },
    { new: true, upsert: true }
  );
  return doc;
}

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
};
