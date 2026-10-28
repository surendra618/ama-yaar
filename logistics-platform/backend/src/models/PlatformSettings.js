const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema(
  {
    carriers: {
      delhivery: {
        active: { type: Boolean, default: true },
        apiToken: { type: String, default: '' },
        clientName: { type: String, default: 'AMAYAAR_LOGISTICS' },
        mode: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
      },
      bluedart: {
        active: { type: Boolean, default: true },
        customerCode: { type: String, default: '' },
        loginId: { type: String, default: '' },
        licenseKey: { type: String, default: '' },
        mode: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
      },
      dtdc: {
        active: { type: Boolean, default: true },
        customerCode: { type: String, default: '' },
        apiToken: { type: String, default: '' },
        mode: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
      },
      shadowfax: {
        active: { type: Boolean, default: true },
        apiKey: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        mode: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
      },
    },
    markupPercentage: { type: Number, default: 12 }, // Platform margin added to base carrier rates
    codPricing: {
      flatFee: { type: Number, default: 40 },
      percentageFee: { type: Number, default: 2.0 }, // whichever is higher
    },
    platformAnnouncement: { type: String, default: 'LogixWave Multi-Carrier Network operational across 27,000+ Indian pincodes.' },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
