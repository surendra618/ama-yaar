const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');

router.get('/:awb', async (req, res) => {
  try {
    const { awb } = req.params;
    const shipment = await Shipment.findOne({
      $or: [{ 'courier.awbNumber': awb }, { orderNumber: awb }],
    }).select('orderNumber courier status trackingTimeline buyer.city buyer.state createdAt');

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'No shipment found for this AWB / Order Number' });
    }

    res.json({
      success: true,
      shipment: {
        orderNumber: shipment.orderNumber,
        carrier: shipment.courier?.carrier || 'Express',
        awbNumber: shipment.courier?.awbNumber,
        status: shipment.status,
        destinationCity: shipment.buyer?.city,
        destinationState: shipment.buyer?.state,
        createdAt: shipment.createdAt,
        timeline: shipment.trackingTimeline.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
