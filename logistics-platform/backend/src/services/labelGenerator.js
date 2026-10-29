/**
 * 4x6 inch Thermal Shipping Label Generator
 * Industry-standard e-commerce barcode label
 */

function generateThermalLabelHtml(shipment) {
  const isCod = shipment.payment.mode === 'COD';
  const amountToCollect = isCod ? `₹${shipment.payment.collectableAmount || shipment.payment.subtotal}` : 'PREPAID';
  const awb = shipment.courier?.awbNumber || 'PENDING-AWB';
  const carrier = shipment.courier?.carrier || 'SURFACE EXPRESS';

  const buyer = shipment.buyer;
  const pickup = shipment.pickupAddressSnapshot || {};
  const packageD = shipment.packageDetails || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipping Label - ${shipment.orderNumber}</title>
  <style>
    @page {
      size: 4in 6in;
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 12px;
      width: 3.8in;
      box-sizing: border-box;
      color: #000;
      background: #fff;
    }
    .label-card {
      border: 2px solid #000;
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 6px;
    }
    .brand {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .carrier-box {
      border: 1.5px solid #000;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .barcode-area {
      text-align: center;
      padding: 10px 0 6px 0;
      border-bottom: 2px solid #000;
    }
    .barcode-mock {
      height: 40px;
      background: repeating-linear-gradient(
        90deg,
        #000 0,
        #000 2px,
        #fff 2px,
        #fff 4px,
        #000 4px,
        #000 7px,
        #fff 7px,
        #fff 9px
      );
      width: 80%;
      margin: 0 auto;
    }
    .awb-text {
      font-family: monospace;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      margin-top: 4px;
    }
    .payment-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${isCod ? '#000' : '#f0f0f0'};
      color: ${isCod ? '#fff' : '#000'};
      padding: 6px 10px;
      font-weight: 900;
      font-size: 13px;
      margin: 8px 0;
      border: 1px solid #000;
    }
    .address-section {
      border-bottom: 1px solid #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.4;
    }
    .section-title {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
    }
    .recipient-name {
      font-size: 13px;
      font-weight: 900;
      margin: 2px 0;
    }
    .pin-badge {
      display: inline-block;
      background: #000;
      color: #fff;
      font-weight: 900;
      font-size: 12px;
      padding: 1px 6px;
      margin-top: 4px;
    }
    .items-table {
      width: 100%;
      font-size: 10px;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .items-table th, .items-table td {
      border: 1px solid #ccc;
      padding: 3px 5px;
      text-align: left;
    }
    .items-table th {
      background: #f7f7f7;
    }
    .return-address {
      font-size: 9px;
      color: #444;
      line-height: 1.3;
      border-top: 1px dashed #000;
      padding-top: 6px;
    }
    .footer-note {
      text-align: center;
      font-size: 8px;
      color: #666;
      margin-top: 6px;
      text-transform: uppercase;
    }
  </style>
</head>
<body onload="window.print()">
  <div class="label-card">
    <div class="header">
      <div class="brand">LOGIXWAVE AIRBILL</div>
      <div class="carrier-box">${carrier}</div>
    </div>

    <div class="barcode-area">
      <div class="barcode-mock"></div>
      <div class="awb-text">AWB: ${awb}</div>
    </div>

    <div class="payment-strip">
      <span>${isCod ? '★ CASH ON DELIVERY (COD) ★' : 'PREPAID SHIPMENT'}</span>
      <span>${amountToCollect}</span>
    </div>

    <div class="address-section">
      <div class="section-title">DELIVER TO:</div>
      <div class="recipient-name">${buyer.name}</div>
      <div>${buyer.addressLine1} ${buyer.addressLine2 ? ', ' + buyer.addressLine2 : ''}</div>
      <div>${buyer.city}, ${buyer.state}</div>
      <div>Phone: <strong>${buyer.phone}</strong></div>
      <div class="pin-badge">PIN: ${buyer.pincode}</div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Order #${shipment.orderNumber}</th>
          <th style="width: 35px; text-align: center;">Qty</th>
          <th style="width: 55px; text-align: right;">Val</th>
        </tr>
      </thead>
      <tbody>
        ${(shipment.items || [])
          .map(
            (item) => `
          <tr>
            <td>${item.name.slice(0, 32)} (${item.sku || 'SKU'})</td>
            <td style="text-align: center;">${item.units || 1}</td>
            <td style="text-align: right;">₹${item.sellingPrice || 0}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 6px;">
      <span><strong>Weight:</strong> ${packageD.billableWeight || 0.5} KG</span>
      <span><strong>Dimensions:</strong> ${packageD.length || 20}x${packageD.breadth || 15}x${packageD.height || 5} CM</span>
      <span><strong>Date:</strong> ${new Date(shipment.createdAt).toLocaleDateString()}</span>
    </div>

    <div class="return-address">
      <strong>RETURN TO (RTO):</strong> ${pickup.locationNickname || 'Warehouse'} c/o ${pickup.contactPerson || 'Seller'}, 
      ${pickup.addressLine1 || ''}, ${pickup.city || ''}, ${pickup.state || ''} - ${pickup.pincode || ''}. 
      Ph: ${pickup.phone || ''}
    </div>

    <div class="footer-note">
      Powered by LogixWave Logistics OS &bull; Routing Hub: IXW-${buyer.pincode.slice(0, 3)}
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = {
  generateThermalLabelHtml,
};
