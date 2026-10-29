import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import RechargeModal from '../components/RechargeModal';

export default function WalletPage() {
  const { walletBalance, refreshBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeModal, setRechargeModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data?.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.warn('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" /> Wallet &amp; Freight Billing Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Real-time balance deduction for shipping labels and automated COD remittances
          </p>
        </div>
        <button
          onClick={() => setRechargeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" /> Recharge Wallet
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Available Balance
          </p>
          <p className="text-4xl font-black font-mono tracking-tight">
            ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-300">
            Usable for Delhivery, Blue Dart, DTDC, and Shadowfax dispatch labels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRechargeModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Add Money +
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Passbook / Transaction History</h3>
            <p className="text-xs text-slate-500">Detailed statement of freight charges, recharges, and remittances</p>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description / Reference</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isCredit = tx.type.startsWith('CREDIT');
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        {tx.referenceId && (
                          <p className="font-mono text-[10px] text-slate-400">Ref: {tx.referenceId}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isCredit ? (
                            <>
                              <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> Credit
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3 text-rose-600" /> Debit
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-black font-mono text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-600">
                        ₹{tx.balanceAfter}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rechargeModal && (
        <RechargeModal
          onClose={() => {
            setRechargeModal(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
