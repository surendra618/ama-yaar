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
      exchangePolicyEnabled: true,
      exchangeDays: 7,
      exchangeCharge: 0,
      isExchangeFree: true,
      exchangePolicyText:
        'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.',
      returnPolicyText:
        'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.',
      defaultFabric: '100% Super Combed Terry Cotton',
      defaultGsm: '380 GSM Heavyweight Fabric',
      defaultFit: 'Oversized Streetwear Fit, Dropped Shoulder',
      defaultCare:
        'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
      defaultCountryOfOrigin: 'India',
      defaultStylingTip:
        'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.',
      defaultWhatsOnPrint:
        'High-density puff and screen print with reinforced twin needle stitching.',
    });
  } else if (!doc.exchangePolicyText) {
    doc.exchangePolicyEnabled = doc.exchangePolicyEnabled ?? true;
    doc.exchangeDays = doc.exchangeDays ?? 7;
    doc.exchangeCharge = doc.exchangeCharge ?? 0;
    doc.isExchangeFree = doc.isExchangeFree ?? true;
    doc.exchangePolicyText =
      doc.exchangePolicyText ||
      'Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.';
    doc.returnPolicyText =
      doc.returnPolicyText ||
      'Easy returns within 7 days of delivery. Refunds are credited to the original payment mode or store credit within 24-48 hours after quality check.';
    doc.defaultFabric = doc.defaultFabric || '100% Super Combed Terry Cotton';
    doc.defaultGsm = doc.defaultGsm || '380 GSM Heavyweight Fabric';
    doc.defaultFit = doc.defaultFit || 'Oversized Streetwear Fit, Dropped Shoulder';
    doc.defaultCare =
      doc.defaultCare ||
      'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.';
    doc.defaultCountryOfOrigin = doc.defaultCountryOfOrigin || 'India';
    doc.defaultStylingTip =
      doc.defaultStylingTip ||
      'Complete the look with our Black Rugged Jeans or Cargo Pants and clean white sneakers for an effortless street vibe.';
    doc.defaultWhatsOnPrint =
      doc.defaultWhatsOnPrint ||
      'High-density puff and screen print with reinforced twin needle stitching.';
    await doc.save();
  }
  return doc;
}

async function updateDeliverySettings(data = {}) {
  const update = {};

  // 1. Delivery
  if (data.deliveryCharge !== undefined) update.deliveryCharge = Math.max(0, Number(data.deliveryCharge));
  if (data.freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = Math.max(0, Number(data.freeDeliveryThreshold));
  if (data.isFreeDeliveryEnabled !== undefined) update.isFreeDeliveryEnabled = Boolean(data.isFreeDeliveryEnabled);
  if (data.isDeliveryFeeActive !== undefined) update.isDeliveryFeeActive = Boolean(data.isDeliveryFeeActive);
  if (data.estimatedDeliveryDays !== undefined) update.estimatedDeliveryDays = String(data.estimatedDeliveryDays).trim();

  // 2. Exchange Policy & Charges
  if (data.exchangePolicyEnabled !== undefined) update.exchangePolicyEnabled = Boolean(data.exchangePolicyEnabled);
  if (data.exchangeDays !== undefined) update.exchangeDays = Math.max(0, Number(data.exchangeDays));
  if (data.exchangeCharge !== undefined) update.exchangeCharge = Math.max(0, Number(data.exchangeCharge));
  if (data.isExchangeFree !== undefined) update.isExchangeFree = Boolean(data.isExchangeFree);
  if (data.exchangePolicyText !== undefined) update.exchangePolicyText = String(data.exchangePolicyText).trim();
  if (data.returnPolicyText !== undefined) update.returnPolicyText = String(data.returnPolicyText).trim();

  // 3. Product Description & Details Defaults
  if (data.defaultFabric !== undefined) update.defaultFabric = String(data.defaultFabric).trim();
  if (data.defaultGsm !== undefined) update.defaultGsm = String(data.defaultGsm).trim();
  if (data.defaultFit !== undefined) update.defaultFit = String(data.defaultFit).trim();
  if (data.defaultCare !== undefined) update.defaultCare = String(data.defaultCare).trim();
  if (data.defaultCountryOfOrigin !== undefined) update.defaultCountryOfOrigin = String(data.defaultCountryOfOrigin).trim();
  if (data.defaultStylingTip !== undefined) update.defaultStylingTip = String(data.defaultStylingTip).trim();
  if (data.defaultWhatsOnPrint !== undefined) update.defaultWhatsOnPrint = String(data.defaultWhatsOnPrint).trim();

  // 4. Shiprocket Logistics Integration
  if (data.shiprocketEnabled !== undefined) update.shiprocketEnabled = Boolean(data.shiprocketEnabled);
  if (data.shiprocketEmail !== undefined) update.shiprocketEmail = String(data.shiprocketEmail).trim();
  if (data.shiprocketPassword !== undefined) update.shiprocketPassword = String(data.shiprocketPassword).trim();
  if (data.shiprocketToken !== undefined) update.shiprocketToken = String(data.shiprocketToken).trim();
  if (data.shiprocketPickupLocation !== undefined) update.shiprocketPickupLocation = String(data.shiprocketPickupLocation).trim();
  if (data.shiprocketSenderPincode !== undefined) update.shiprocketSenderPincode = String(data.shiprocketSenderPincode).trim();
  if (data.shiprocketAutoCreateOrder !== undefined) update.shiprocketAutoCreateOrder = Boolean(data.shiprocketAutoCreateOrder);
  if (data.shiprocketAutoGenerateAwb !== undefined) update.shiprocketAutoGenerateAwb = Boolean(data.shiprocketAutoGenerateAwb);
  if (data.defaultPackageWeight !== undefined) update.defaultPackageWeight = Math.max(0.05, Number(data.defaultPackageWeight));
  if (data.defaultPackageLength !== undefined) update.defaultPackageLength = Math.max(1, Number(data.defaultPackageLength));
  if (data.defaultPackageBreadth !== undefined) update.defaultPackageBreadth = Math.max(1, Number(data.defaultPackageBreadth));
  if (data.defaultPackageHeight !== undefined) update.defaultPackageHeight = Math.max(1, Number(data.defaultPackageHeight));
  if (data.shiprocketWebhookSecret !== undefined) update.shiprocketWebhookSecret = String(data.shiprocketWebhookSecret).trim();

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
