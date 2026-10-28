import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { ShieldCheck, X, Building2, CreditCard, RefreshCw, Check } from 'lucide-react';

export default function KycModal({ onClose }) {
  const { merchant } = useAuth();
  const [gstin, setGstin] = useState(merchant?.kyc?.gstin || '09AAACA1234A1Z5');
  const [pan, setPan] = useState(merchant?.kyc?.pan || 'AAACA1234A');
  const [bankName, setBankName] = useState(merchant?.kyc?.bankAccount?.bankName || 'HDFC Bank');
  const [accountName, setAccountName] = useState(merchant?.kyc?.bankAccount?.accountName || merchant?.companyName || 'AMA YAAR Retail LLP');
  const [accountNumber, setAccountNumber] = useState(merchant?.kyc?.bankAccount?.accountNumber || '918097309680');
  const [ifsc, setIfsc] = useState(merchant?.kyc?.bankAccount?.ifsc || 'HDFC0001234');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.post('/auth/kyc', {
        gstin,
        pan,
        bankAccount: {
          bankName,
          accountName,
          accountNumber,
          ifsc,
        },
      });
      if (res.data?.success) {
        setSaved(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update KYC');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Merchant KYC &amp; Remittance Bank Account</h3>
              <p className="text-[11px] text-slate-400">Required for automated Cash on Delivery (COD) payouts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {saved ? (
            <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <Check className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="font-extrabold text-emerald-900 text-sm">KYC &amp; Remittance Details Verified!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Proprietor PAN</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <CreditCard className="h-4 w-4 text-indigo-600" /> Bank Account for COD Remittance Payouts
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                      placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Account Beneficiary Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save & Verify KYC'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
