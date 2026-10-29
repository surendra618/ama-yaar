const axios = require('axios');

/**
 * Delhivery One API Adapter (Production & Staging)
 * Connects directly to Delhivery B2B API without intermediary aggregator fee
 */

const DELHIVERY_PROD_URL = 'https://track.delhivery.com';
const DELHIVERY_STAGE_URL = 'https://staging-express.delhivery.com';

function getBaseUrl() {
  return process.env.DELHIVERY_ENV === 'production' ? DELHIVERY_PROD_URL : DELHIVERY_STAGE_URL;
}

function getAuthHeader() {
  const token = process.env.DELHIVERY_API_KEY;
  return token ? { Authorization: `Token ${token}` } : {};
}

/**
 * Check Delhivery pincode serviceability
 */
async function checkPincodeServiceability(pincode) {
  if (!process.env.DELHIVERY_API_KEY) return { isAvailable: true, message: 'Sandbox mode' };
  try {
    const res = await axios.get(`${getBaseUrl()}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: getAuthHeader(),
      timeout: 10000,
    });
    const deliveryCodes = res.data?.delivery_codes || [];
    const pinData = deliveryCodes.find((d) => d.postal_code?.pin === Number(pincode));
    return {
      isAvailable: Boolean(pinData && pinData.postal_code?.is_oda !== 'Y'),
      codAvailable: pinData?.postal_code?.cod === 'Y',
      prepaidAvailable: pinData?.postal_code?.pre_paid === 'Y',
      data: pinData,
    };
  } catch (err) {
    console.warn('Delhivery pincode serviceability API error:', err.message);
    return { isAvailable: true, fallback: true };
  }
}

/**
 * Fetch bulk/single Waybill numbers from Delhivery
 */
async function generateWaybills(count = 1) {
  if (!process.env.DELHIVERY_API_KEY) return null;
  try {
    const res = await axios.get(`${getBaseUrl()}/waybill/api/bulk/json/?count=${count}`, {
      headers: getAuthHeader(),
      timeout: 10000,
    });
    return res.data; // e.g. "14389278912"
  } catch (err) {
    console.warn('Delhivery waybill API error:', err.message);
    return null;
  }
}

/**
 * Create Live Shipment on Delhivery
 */
async function createShipment(shipment) {
  if (!process.env.DELHIVERY_API_KEY) return null;

  const isCod = shipment.payment.mode === 'COD';
  const payload = {
    shipments: [
      {
        name: shipment.buyer.name,
        add: shipment.buyer.addressLine1 + (shipment.buyer.addressLine2 ? ', ' + shipment.buyer.addressLine2 : ''),
        pin: shipment.buyer.pincode,
        city: shipment.buyer.city,
        state: shipment.buyer.state,
        country: 'India',
        phone: shipment.buyer.phone,
        order: shipment.orderNumber,
        payment_mode: isCod ? 'COD' : 'Pre-paid',
        cod_amount: isCod ? String(shipment.payment.collectableAmount) : '0',
        weight: String(shipment.packageDetails.billableWeight * 1000), // grams
        products_desc: shipment.items?.[0]?.name || 'Apparel',
        quantity: String(shipment.items?.[0]?.units || 1),
        pickup_location: shipment.pickupAddressSnapshot?.locationNickname || 'Primary Hub',
      },
    ],
    pickup_location: {
      name: shipment.pickupAddressSnapshot?.locationNickname || 'Primary Hub',
    },
  };

  try {
    const res = await axios.post(`${getBaseUrl()}/api/cmu/create.json`, `format=json&data=${JSON.stringify(payload)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...getAuthHeader(),
      },
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    console.warn('Delhivery CMU create error:', err.message);
    return null;
  }
}

/**
 * Track live Delhivery package
 */
async function trackWaybill(waybill) {
  if (!process.env.DELHIVERY_API_KEY) return null;
  try {
    const res = await axios.get(`${getBaseUrl()}/api/v1/packages/json/?waybill=${waybill}`, {
      headers: getAuthHeader(),
      timeout: 10000,
    });
    return res.data;
  } catch (err) {
    console.warn('Delhivery track error:', err.message);
    return null;
  }
}

module.exports = {
  checkPincodeServiceability,
  generateWaybills,
  createShipment,
  trackWaybill,
};
