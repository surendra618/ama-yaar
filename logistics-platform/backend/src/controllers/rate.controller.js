const { getRateComparison } = require('../services/courier/rateEngine');

exports.calculateRates = async (req, res) => {
  try {
    const { pickupPin, deliveryPin, length, breadth, height, weight, isCod, collectableAmount } = req.body;

    if (!pickupPin || !deliveryPin) {
      return res.status(400).json({ success: false, message: 'Pickup and delivery pincodes are required' });
    }

    const comparison = getRateComparison(
      pickupPin,
      deliveryPin,
      length || 20,
      breadth || 15,
      height || 5,
      weight || 0.5,
      Boolean(isCod),
      collectableAmount || 0
    );

    res.json({ success: true, ...comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkServiceability = async (req, res) => {
  try {
    const { pickupPin, deliveryPin, pickup_postcode, delivery_postcode, weight, cod, amount } = req.query;
    const pPin = pickupPin || pickup_postcode || '226010';
    const dPin = deliveryPin || delivery_postcode;

    if (!dPin) {
      return res.status(400).json({ success: false, message: 'Delivery pincode (deliveryPin or delivery_postcode) is required' });
    }

    const isCod = cod === '1' || cod === 'true';
    const wt = Number(weight || 0.5);

    const comparison = getRateComparison(pPin, dPin, 20, 15, 5, wt, isCod, Number(amount || 0));

    res.json({
      success: true,
      serviceable: true,
      deliveryPincode: dPin,
      pickupPincode: pPin,
      zone: comparison.zone,
      estimatedDeliveryDays: comparison.cheapestCarrier?.etdDays || 3,
      rates: comparison.rates,
      recommended: comparison.cheapestCarrier,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
