import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  Plus,
  Bell,
  User,
  LogOut,
  Search,
  ShieldCheck,
  Crown,
  ArrowLeft,
  Key,
  Lock,
} from 'lucide-react';
import RechargeModal from './RechargeModal';
import KycModal from './KycModal';
import SwitchAccountModal from './SwitchAccountModal';

export default function Navbar() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const { merchant, walletBalance, logout, openSwitchModal } = useAuth();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
        {/* Left: Quick Search */}
        <div className="flex items-center gap-3 w-80">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isAdminRoute ? "Search all merchants, orders, AWBs..." : "Search by AWB, Order ID, Phone..."}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Center: When in Admin Mode, show Master Platform Status */}
        {isAdminRoute && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold">
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            <span>Super Admin Hub</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              4 Master Courier Gateways Active
            </span>
          </div>
        )}

        {/* Right: Context-Aware Actions */}
        <div className="flex items-center gap-3">
          {isAdminRoute ? (
            /* SUPER ADMIN ACTIONS */
            <>
              <button
                type="button"
                onClick={() => openSwitchModal('merchant')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Switch to Merchant Store Console using Merchant ID & Password"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Switch to Merchant</span>
              </button>
            </>
          ) : (
            /* MERCHANT ACTIONS */
            <>
              {/* Live Wallet Pill */}
              <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/90 px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wallet className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950 font-mono">
                    ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => setRechargeOpen(true)}
                  className="ml-1 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Recharge
                </button>
              </div>

              {/* KYC Badge Button */}
              <button
                onClick={() => setKycOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-[11px] font-semibold transition cursor-pointer"
                title="View/Update Merchant KYC & Bank Account"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>KYC Verified</span>
              </button>

              {/* Super Admin Switch Button */}
              <button
                type="button"
                onClick={() => openSwitchModal('admin')}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
                title="Switch to Super Admin Console with Admin ID & Password"
              >
                <Crown className="h-3 w-3 text-amber-600" />
                <span>Switch to Admin</span>
              </button>
            </>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <div
                className={`h-8 w-8 rounded-lg font-extrabold flex items-center justify-center text-xs shadow-xs ${
                  isAdminRoute ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-amber-400'
                }`}
              >
                {isAdminRoute ? '★' : merchant?.companyName?.slice(0, 2).toUpperCase() || 'LW'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">
                  {isAdminRoute ? 'Super Admin' : merchant?.companyName || 'Merchant'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isAdminRoute ? 'Platform Root' : merchant?.email}
                </p>
              </div>
            </button>

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">
                    {isAdminRoute ? 'Super Admin Platform' : merchant?.companyName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {isAdminRoute ? 'admin@logixwave.com' : merchant?.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false);
                      openSwitchModal(isAdminRoute ? 'merchant' : 'admin');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Switch ID / Password</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Switch Account Modal (Can be triggered from anywhere) */}
      <SwitchAccountModal />

      {/* Recharge Modal */}
      {rechargeOpen && <RechargeModal onClose={() => setRechargeOpen(false)} />}

      {/* KYC Modal */}
      {kycOpen && <KycModal onClose={() => setKycOpen(false)} />}
    </>
  );
}
