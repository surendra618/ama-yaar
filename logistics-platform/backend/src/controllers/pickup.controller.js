const PickupLocation = require('../models/PickupLocation');
const Merchant = require('../models/Merchant');

exports.listLocations = async (req, res) => {
  try {
    const locations = await PickupLocation.find({ merchant: req.merchant._id, active: true }).sort({
      isPrimary: -1,
      createdAt: -1,
    });
    res.json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const {
      locationNickname,
      contactPerson,
      phone,
      email,
      addressLine1,
      addressLine2,
      pincode,
      city,
      state,
      isPrimary,
    } = req.body;

    if (!locationNickname || !contactPerson || !phone || !addressLine1 || !pincode || !city || !state) {
      return res.status(400).json({ success: false, message: 'Please fill all required warehouse address fields' });
    }

    if (isPrimary) {
      await PickupLocation.updateMany({ merchant: req.merchant._id }, { isPrimary: false });
    }

    const count = await PickupLocation.countDocuments({ merchant: req.merchant._id });
    const location = await PickupLocation.create({
      merchant: req.merchant._id,
      locationNickname,
      contactPerson,
      phone,
      email: email || req.merchant.email,
      addressLine1,
      addressLine2,
      pincode,
      city,
      state,
      isPrimary: Boolean(isPrimary || count === 0),
    });

    if (location.isPrimary) {
      await Merchant.findByIdAndUpdate(req.merchant._id, { defaultPickupLocation: location._id });
    }

    res.status(201).json({ success: true, message: 'Pickup location created successfully', location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await PickupLocation.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Pickup location not found' });
    }
    location.active = false;
    await location.save();
    res.json({ success: true, message: 'Pickup location removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
