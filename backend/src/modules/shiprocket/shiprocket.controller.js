const mongoose = require('mongoose');
const service = require('./shiprocket.service');
const Order = require('../order/order.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

async function getConfig(req, res, next) {
  try {
    const config = await service.getShiprocketConfig();
    res.json(
      new ApiResponse(200, {
        isEnabled: config.isEnabled,
        pickupLocation: config.pickupLocation,
        senderPincode: config.senderPincode,
        autoCreateOrder: config.autoCreateOrder,
        autoGenerateAwb: config.autoGenerateAwb,
        defaultPackageWeight: config.defaultPackageWeight,
        defaultPackageLength: config.defaultPackageLength,
        defaultPackageBreadth: config.defaultPackageBreadth,
        defaultPackageHeight: config.defaultPackageHeight,
        hasEmail: Boolean(config.email),
        hasPassword: Boolean(config.password),
      })
    );
  } catch (err) {
    next(err);
  }
}

async function testConnection(req, res, next) {
  try {
    const result = await service.testConnection(req.body);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

async function getPickupLocations(req, res, next) {
  try {
    const locations = await service.getPickupLocations();
    res.json(new ApiResponse(200, locations));
  } catch (err) {
    next(err);
  }
}

async function checkServiceability(req, res, next) {
  try {
    const { pincode, deliveryPincode, pickupPincode, cod, weight } = req.query;
    const pin = pincode || deliveryPincode;
    const result = await service.checkServiceability({
      deliveryPincode: pin,
      pickupPincode,
      cod: cod === '0' || cod === 'false' ? 0 : 1,
      weight: Number(weight) || 0.5,
    });
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.createShiprocketOrder(orderId, req.body);
    res.json(new ApiResponse(200, result, 'Order pushed to Shiprocket successfully'));
  } catch (err) {
    next(err);
  }
}

async function assignAwb(req, res, next) {
  try {
    const { orderId } = req.params;
    const { courierId } = req.body;
    const result = await service.assignAwb(orderId, courierId);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

async function requestPickup(req, res, next) {
  try {
    const { orderId } = req.params;
    const { pickupDate } = req.body;
    const result = await service.requestPickup(orderId, pickupDate);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

async function generateLabel(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.generateLabel(orderId);
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function generateInvoice(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.generateInvoice(orderId);
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function generateManifest(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.generateManifest(orderId);
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function trackOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const cleanId = String(orderId).trim();
    // Authorization check
    if (req.user && req.user.role !== 'admin') {
      const query = mongoose.Types.ObjectId.isValid(cleanId)
        ? { _id: cleanId }
        : {
            $or: [
              { orderNumber: cleanId },
              { 'shiprocket.awbCode': cleanId },
              { trackingNumber: cleanId },
            ],
          };
      const order = await Order.findOne(query).select('user');
      if (!order) throw new ApiError(404, 'Order not found');
      if (order.user && order.user.toString() !== req.user.id) {
        throw new ApiError(403, 'Forbidden: You do not have permission to view this order');
      }
    }

    const result = await service.trackShipment(orderId);
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function trackAwb(req, res, next) {
  try {
    const { awbCode } = req.params;
    const result = await service.trackAwbCode(awbCode);
    res.json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.cancelShiprocketOrder(orderId);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

async function handleWebhook(req, res, next) {
  try {
    const result = await service.handleWebhook(req.body);
    res.json(new ApiResponse(200, result, 'Webhook processed successfully'));
  } catch (err) {
    // Webhooks should return 200 or 400 gracefully so provider doesn't constantly retry on schema mismatch
    res.status(200).json({ success: false, error: err.message });
  }
}

async function clearOrderError(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.clearOrderError(orderId);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

async function manualShip(req, res, next) {
  try {
    const { orderId } = req.params;
    const result = await service.manualShip(orderId, req.body);
    res.json(new ApiResponse(200, result, result.message));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConfig,
  testConnection,
  getPickupLocations,
  checkServiceability,
  createOrder,
  assignAwb,
  requestPickup,
  generateLabel,
  generateInvoice,
  generateManifest,
  trackOrder,
  trackAwb,
  cancelOrder,
  handleWebhook,
  clearOrderError,
  manualShip,
};
