/**
 * Rate Calculation & Zone Matrix Engine for Indian eCommerce Logistics
 */

// Zone classification based on Indian Pincodes
function getZone(pickupPin, deliveryPin) {
  const pStr = String(pickupPin).trim();
  const dStr = String(deliveryPin).trim();

  // Intra-city (same first 3 digits)
  if (pStr.slice(0, 3) === dStr.slice(0, 3)) {
    return 'ZONE_A'; // Intra-city
  }

  // Same State / Regional (same first 2 digits)
  if (pStr.slice(0, 2) === dStr.slice(0, 2)) {
    return 'ZONE_B'; // Within State
  }

  // Metro prefix lists (Delhi NCR: 11,12; Mumbai: 40; Bengaluru: 56; Chennai: 60; Kolkata: 70; Hyderabad: 50)
  const metros = ['11', '12', '40', '56', '60', '70', '50'];
  const isPickupMetro = metros.includes(pStr.slice(0, 2));
  const isDeliveryMetro = metros.includes(dStr.slice(0, 2));

  if (isPickupMetro && isDeliveryMetro) {
    return 'ZONE_C'; // Metro to Metro
  }

  // Special / Remote zones (J&K: 19; NE: 78, 79; Kerala: 68; Islands: 74)
  const special = ['19', '78', '79', '68', '74'];
  if (special.includes(dStr.slice(0, 2))) {
    return 'ZONE_E'; // Special / Remote
  }

  return 'ZONE_D'; // Rest of India
}

// Carrier Rate Cards (Base 0.5kg + Additional 0.5kg + COD surcharge)
const CARRIERS = [
  {
    id: 'delhivery_surface',
    carrier: 'Delhivery Surface Express',
    type: 'Surface',
    rating: 4.6,
    speedDays: { ZONE_A: 1, ZONE_B: 2, ZONE_C: 3, ZONE_D: 4, ZONE_E: 5 },
    rates: {
      ZONE_A: { base: 36, add: 26 },
      ZONE_B: { base: 42, add: 30 },
      ZONE_C: { base: 48, add: 34 },
      ZONE_D: { base: 56, add: 38 },
      ZONE_E: { base: 75, add: 55 },
    },
    codFee: 30, // or 2%
    codPercent: 0.02,
  },
  {
    id: 'bluedart_ground',
    carrier: 'Blue Dart Ground',
    type: 'Surface',
    rating: 4.8,
    speedDays: { ZONE_A: 1, ZONE_B: 2, ZONE_C: 2, ZONE_D: 3, ZONE_E: 5 },
    rates: {
      ZONE_A: { base: 45, add: 32 },
      ZONE_B: { base: 52, add: 36 },
      ZONE_C: { base: 58, add: 40 },
      ZONE_D: { base: 68, add: 48 },
      ZONE_E: { base: 90, add: 65 },
    },
    codFee: 35,
    codPercent: 0.02,
  },
  {
    id: 'dtdc_express',
    carrier: 'DTDC DotZot Priority',
    type: 'Express',
    rating: 4.4,
    speedDays: { ZONE_A: 1, ZONE_B: 2, ZONE_C: 3, ZONE_D: 4, ZONE_E: 6 },
    rates: {
      ZONE_A: { base: 34, add: 25 },
      ZONE_B: { base: 39, add: 28 },
      ZONE_C: { base: 46, add: 32 },
      ZONE_D: { base: 54, add: 36 },
      ZONE_E: { base: 72, add: 50 },
    },
    codFee: 28,
    codPercent: 0.018,
  },
  {
    id: 'shadowfax_surface',
    carrier: 'Shadowfax Flash',
    type: 'Surface',
    rating: 4.3,
    speedDays: { ZONE_A: 1, ZONE_B: 2, ZONE_C: 3, ZONE_D: 4, ZONE_E: 6 },
    rates: {
      ZONE_A: { base: 32, add: 24 },
      ZONE_B: { base: 38, add: 27 },
      ZONE_C: { base: 44, add: 30 },
      ZONE_D: { base: 52, add: 35 },
      ZONE_E: { base: 70, add: 48 },
    },
    codFee: 25,
    codPercent: 0.018,
  },
];

/**
 * Calculate rate for given carrier and shipment parameters
 */
function calculateCarrierRate(carrierConfig, zone, billableWeightKg, isCod, collectableAmount = 0) {
  const zoneRates = carrierConfig.rates[zone] || carrierConfig.rates.ZONE_D;
  const unitsOf500g = Math.max(1, Math.ceil(billableWeightKg / 0.5));

  // Base 0.5kg + additional 0.5kg chunks
  const freight = zoneRates.base + (unitsOf500g - 1) * zoneRates.add;

  let codCharge = 0;
  if (isCod) {
    const calculatedFee = Number(collectableAmount) * carrierConfig.codPercent;
    codCharge = Math.max(carrierConfig.codFee, Math.round(calculatedFee));
  }

  const etdDays = carrierConfig.speedDays[zone] || 4;
  const etdDate = new Date();
  etdDate.setDate(etdDate.getDate() + etdDays);

  return {
    carrierId: carrierConfig.id,
    carrierName: carrierConfig.carrier,
    type: carrierConfig.type,
    rating: carrierConfig.rating,
    zone,
    freightCharge: freight,
    codCharge,
    totalCost: freight + codCharge,
    etdDays,
    etdDate: etdDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
  };
}

/**
 * Compare all carriers and return sorted list with cheapest & fastest badges
 */
function getRateComparison(pickupPin, deliveryPin, length, breadth, height, deadWeightKg, isCod, collectableAmount = 0) {
  const dead = Number(deadWeightKg) || 0.5;
  const vol = (Number(length || 20) * Number(breadth || 15) * Number(height || 5)) / 5000;
  const billableWeight = Math.max(dead, vol);

  const zone = getZone(pickupPin, deliveryPin);

  const results = CARRIERS.map((carrier) =>
    calculateCarrierRate(carrier, zone, billableWeight, isCod, collectableAmount)
  );

  // Identify cheapest and fastest
  const sortedByPrice = [...results].sort((a, b) => a.totalCost - b.totalCost);
  const sortedByTime = [...results].sort((a, b) => a.etdDays - b.etdDays);

  const cheapestId = sortedByPrice[0].carrierId;
  const fastestId = sortedByTime[0].carrierId;

  return {
    zone,
    deadWeightKg: dead,
    volumetricWeightKg: Number(vol.toFixed(2)),
    billableWeightKg: Number(billableWeight.toFixed(2)),
    couriers: results.map((c) => ({
      ...c,
      isCheapest: c.carrierId === cheapestId,
      isFastest: c.carrierId === fastestId,
    })),
  };
}

module.exports = {
  getZone,
  CARRIERS,
  calculateCarrierRate,
  getRateComparison,
};
