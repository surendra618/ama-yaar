/**
 * Logistics Handover Manifest Printout Generator
 * For courier pickup agent signatures and handover verification
 */

function generateManifestHtml(manifest, shipments, pickup) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Handover Manifest - ${manifest.manifestNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #111;
      font-size: 11px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
      font-size: 11px;
      line-height: 1.5;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      background: #fafafa;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 10px;
    }
    .table th, .table td {
      border: 1px solid #000;
      padding: 6px 8px;
      text-align: left;
    }
    .table th {
      background: #eee;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
      padding-top: 20px;
    }
    .sign-box {
      border-top: 1px dashed #000;
      padding-top: 8px;
      text-align: center;
      font-weight: 700;
      font-size: 11px;
    }
  </style>
</head>
<body onload="window.print()">
  <div class="header">
    <div>
      <div class="title">COURIER HANDOVER MANIFEST</div>
      <div>LogixWave Multi-Carrier Logistics Network</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 14px; font-weight: 800;">Manifest #${manifest.manifestNumber}</div>
      <div>Date: ${new Date(manifest.createdAt || Date.now()).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="card">
      <strong>PICKUP WAREHOUSE (ORIGIN):</strong><br>
      ${pickup.locationNickname || 'Primary Warehouse'} (c/o ${pickup.contactPerson || 'Seller'})<br>
      ${pickup.addressLine1 || ''}, ${pickup.city || ''}, ${pickup.state || ''} - ${pickup.pincode || ''}<br>
      Phone: ${pickup.phone || ''}
    </div>

    <div class="card">
      <strong>COURIER &amp; DISPATCH SUMMARY:</strong><br>
      Carrier: <strong>${manifest.carrier}</strong><br>
      Total Consignments: <strong>${manifest.totalShipments} Packages</strong><br>
      Total Weight: <strong>${manifest.totalWeight} KG</strong>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width: 25px;">#</th>
        <th>Order ID</th>
        <th>AWB Tracking Code</th>
        <th>Consignee / Destination</th>
        <th>Payment</th>
        <th style="text-align: right;">Collectable</th>
        <th style="text-align: right;">Weight</th>
      </tr>
    </thead>
    <tbody>
      ${shipments
        .map(
          (s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>#${s.orderNumber}</strong></td>
          <td style="font-family: monospace; font-weight: 800;">${s.courier?.awbNumber || 'PENDING'}</td>
          <td>${s.buyer.name}, ${s.buyer.city} (${s.buyer.pincode})</td>
          <td>${s.payment.mode}</td>
          <td style="text-align: right;">${s.payment.mode === 'COD' ? '₹' + s.payment.collectableAmount : '-'}</td>
          <td style="text-align: right;">${s.packageDetails?.billableWeight || 0.5} KG</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sign-box">
      Courier Pickup Agent Signature &amp; Phone<br>
      <span style="font-size: 9px; color: #666; font-weight: normal;">(Received packages in good condition)</span>
    </div>
    <div class="sign-box">
      Warehouse Dispatch Manager Signature<br>
      <span style="font-size: 9px; color: #666; font-weight: normal;">(Handed over packages for transit)</span>
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = {
  generateManifestHtml,
};
