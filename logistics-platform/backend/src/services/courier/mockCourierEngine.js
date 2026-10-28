/**
 * High-fidelity Multi-Courier Sandbox & Dispatcher Engine
 * Emulates Delhivery, Blue Dart, DTDC, and Shadowfax workflows
 */

function generateAwb(carrierId) {
  const randNum = Math.floor(100000000 + Math.random() * 900000000);
  switch (carrierId) {
    case 'bluedart_ground':
      return `BLU${randNum}`;
    case 'dtdc_express':
      return `DTD${randNum}`;
    case 'shadowfax_surface':
      return `SFX${randNum}`;
    case 'delhivery_surface':
    default:
      return `DEL${randNum}`;
  }
}

function generatePickupToken(carrierId) {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PKP-${carrierId.slice(0, 3).toUpperCase()}-${rand}`;
}

const MILESTONE_SEQUENCES = [
  { status: 'PICKUP_SCHEDULED', activity: 'Courier pickup scheduled with warehouse hub' },
  { status: 'IN_TRANSIT', activity: 'Package picked up by courier driver & arrived at mother hub' },
  { status: 'IN_TRANSIT', activity: 'Consignment departed from regional sorting facility' },
  { status: 'OUT_FOR_DELIVERY', activity: 'Out for delivery with delivery executive' },
  { status: 'DELIVERED', activity: 'Shipment delivered successfully to consignee' },
];

function getNextSimulatedStatus(currentStatus) {
  switch (currentStatus) {
    case 'AWB_ASSIGNED':
      return {
        status: 'PICKUP_SCHEDULED',
        activity: 'Pickup scheduled at merchant warehouse',
      };
    case 'PICKUP_SCHEDULED':
      return {
        status: 'IN_TRANSIT',
        activity: 'Package picked up by delivery agent and scanned at sorting center',
      };
    case 'IN_TRANSIT':
      return {
        status: 'OUT_FOR_DELIVERY',
        activity: 'Package assigned to delivery rider for doorstep drop',
      };
    case 'OUT_FOR_DELIVERY':
      return {
        status: 'DELIVERED',
        activity: 'Package handed over to customer (OTP verified / Signed)',
      };
    default:
      return null;
  }
}

module.exports = {
  generateAwb,
  generatePickupToken,
  MILESTONE_SEQUENCES,
  getNextSimulatedStatus,
};
