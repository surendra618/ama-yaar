import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import CreateShipmentPage from './pages/CreateShipmentPage';
import RateCalculatorPage from './pages/RateCalculatorPage';
import WarehousesPage from './pages/WarehousesPage';
import WalletPage from './pages/WalletPage';
import NdrPage from './pages/NdrPage';
import DeveloperApiPage from './pages/DeveloperApiPage';
import TrackPage from './pages/TrackPage';
import ManifestsPage from './pages/ManifestsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMerchantsPage from './pages/admin/AdminMerchantsPage';
import AdminCarriersPage from './pages/admin/AdminCarriersPage';
import AdminRatesPage from './pages/admin/AdminRatesPage';
import AdminShipmentsPage from './pages/admin/AdminShipmentsPage';
import AdminRemittancesPage from './pages/admin/AdminRemittancesPage';

function ProtectedLayout() {
  const { merchant, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
        Loading LogixWave OS...
      </div>
    );
  }

  if (!merchant && !localStorage.getItem('lxw_token')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/manifests" element={<ManifestsPage />} />
            <Route path="/create-order" element={<CreateShipmentPage />} />
            <Route path="/rate-calculator" element={<RateCalculatorPage />} />
            <Route path="/warehouses" element={<WarehousesPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/ndr" element={<NdrPage />} />
            <Route path="/developers" element={<DeveloperApiPage />} />
            <Route path="/track-shipment" element={<TrackPage />} />

            {/* Super Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/merchants" element={<AdminMerchantsPage />} />
            <Route path="/admin/carriers" element={<AdminCarriersPage />} />
            <Route path="/admin/rates" element={<AdminRatesPage />} />
            <Route path="/admin/shipments" element={<AdminShipmentsPage />} />
            <Route path="/admin/remittances" element={<AdminRemittancesPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
