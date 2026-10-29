# LogixWave OS &bull; Multi-Courier Logistics Aggregator (Shiprocket Alternative)

A complete standalone, multi-tenant B2B logistics aggregator platform engineered for Indian eCommerce merchants and brands.

---

## 🌟 Key Features

1. **Multi-Carrier Rate & Allocation Engine**:
   - Calculates Dead Weight vs Volumetric Weight (`L*B*H / 5000`).
   - Automated Indian Pincode Zone Classifier:
     - `ZONE_A`: Intra-city (Same city hub)
     - `ZONE_B`: Within-state (Regional)
     - `ZONE_C`: Metro to Metro
     - `ZONE_D`: Rest of India
     - `ZONE_E`: Special / Remote (J&K, North East, Kerala)
   - Real-time comparative quotes for **Delhivery Surface**, **Blue Dart Ground**, **DTDC DotZot**, and **Shadowfax Flash** with **Cheapest** and **Fastest** recommendation badges.

2. **Order Management & Courier Booking**:
   - Single order booking with customer address validation.
   - 1-Click "Assign Courier" with automatic AWB number generation.
   - Courier warehouse pickup scheduling with token numbers.

3. **Thermal 4x6" Shipping Labels & Handover Manifests**:
   - Standard 4×6 inch thermal barcode shipping labels with Cash on Delivery (COD) collectable badges, barcode lines, and RTO return address.
   - Batch pickup handover manifest sheet with courier driver signature blocks.

4. **Prepaid Wallet & COD Remittance**:
   - Real-time balance verification before dispatch.
   - Instant wallet recharge (₹500, ₹1000, ₹2500, ₹5000 or custom).
   - Detailed passbook transaction ledger tracking freight deductions and COD remittances.

5. **NDR (Non-Delivery Report) & RTO Protection**:
   - Real-time exception inbox for failed delivery attempts (customer door locked, phone unreachable).
   - 1-Click resolution workflow: Re-attempt next day, Update buyer address/pincode, or Initiate RTO.

6. **Interactive Sandbox Simulator**:
   - Test-drive package progression: *Pickup Scheduled &rarr; In Transit &rarr; Out for Delivery &rarr; Delivered / NDR Exception*.

7. **Developer REST APIs**:
   - Every merchant receives a unique `x-client-id` and `x-api-key` to connect external stores (like **AMA YAAR**, Shopify, WooCommerce) directly to LogixWave.

---

## 🚀 Quick Start Guide

### 1. Pre-requisites
- Node.js v18+
- MongoDB Atlas (already connected in `.env`)

### 2. Location
The project is available at both:
- `D:\logistics-platform`
- `d:\AMA YAAR\logistics-platform`

### 3. Start Backend Server (Port 5050)
```bash
cd backend
npm run dev
```
*Backend runs on: `http://localhost:5050`*

### 4. Start Frontend Dashboard (Port 5180)
```bash
cd frontend
npm run dev
```
*Open in Browser: `http://localhost:5180`*

---

## 🔑 Pre-Seeded Login Credentials

### 1. Super Admin Account (Platform Headquarters)
- **Portal URL**: `http://localhost:5180/login`
- **Email**: `admin@logixwave.com`
- **Password**: `Admin@123`
- **Capabilities**: Merchant KYC approvals, wallet manual adjustments, carrier master API keys (Delhivery, Blue Dart, DTDC, Shadowfax), platform profit margin markup (%), and COD remittances.

### 2. Merchant Demo Account (AMA YAAR Apparel Co.)
- **Email**: `demo@logixwave.com`
- **Password**: `Password@123`
- **Capabilities**: Rate calculator, single/bulk order booking, 1-click AWB assignment, 4×6 label printing, handover manifests, prepaid wallet (₹2,500 credits), and public tracking.

---

## 🛡️ Super Admin Management Suite (`/admin`)

| Admin Module | Route | Key Features |
|---|---|---|
| **Overview Dashboard** | `/admin` | Real-time network GMV, delivered COD cash pool, active merchants, and SLAs |
| **Merchants Directory** | `/admin/merchants` | KYC document verification (Approve/Reject), manual wallet balance credit/debit |
| **Carrier Gateways** | `/admin/carriers` | Corporate master API tokens for Delhivery One, Blue Dart, DTDC & Shadowfax |
| **Platform Margins** | `/admin/rates` | Profit margin markup % (+12%) & Cash on Delivery handling fee structure |
| **Global Shipments** | `/admin/shipments` | Master search & tracking across all consignments across India |
| **COD Remittances** | `/admin/remittances` | Merchant bank payout management & UTR settlement confirmation |

---

## 📁 Project Architecture

```
logistics-platform/
├── backend/
│   ├── src/
│   │   ├── config/ (MongoDB Atlas connection)
│   │   ├── models/ (Merchant, PickupLocation, Shipment, WalletTransaction, Manifest)
│   │   ├── services/
│   │   │   ├── courier/
│   │   │   │   ├── rateEngine.js (Indian pincode zone matrix & freight rates)
│   │   │   │   ├── mockCourierEngine.js (AWB dispatcher & simulation lifecycle)
│   │   │   │   └── delhiveryAdapter.js (Direct Delhivery One API adapter)
│   │   │   ├── labelGenerator.js (4x6 thermal barcode label generator)
│   │   │   └── manifestGenerator.js (Printable A4 courier handover sheets)
│   │   ├── controllers/ (auth, wallet, pickup, rate, shipment)
│   │   ├── middlewares/ (JWT & API-Key auth)
│   │   ├── routes/
│   │   └── server.js (Express server on port 5050)
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, Sidebar, KycModal, RechargeModal, AssignCourierModal, SimulateModal)
    │   ├── context/ (AuthContext with live synchronized wallet balance)
    │   ├── pages/
    │   │   ├── DashboardPage.jsx (SLA performance, stats, recent shipments)
    │   │   ├── ShipmentsPage.jsx (Consignments table, AWB, Label print, Pickup, Bulk select)
    │   │   ├── ManifestsPage.jsx (Courier pickup handover dispatch sheets)
    │   │   ├── CreateShipmentPage.jsx (Single Order & Bulk CSV upload)
    │   │   ├── RateCalculatorPage.jsx (Multi-carrier rate comparison tool)
    │   │   ├── WarehousesPage.jsx (Pickup origin address management)
    │   │   ├── WalletPage.jsx (Recharge & ledger passbook statement)
    │   │   ├── NdrPage.jsx (Failed delivery resolution & re-attempt engine)
    │   │   ├── DeveloperApiPage.jsx (API Keys & cURL integration guide)
    │   │   └── TrackPage.jsx (Public AWB live tracking timeline)
    │   └── App.jsx
    └── index.html
```
