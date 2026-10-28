import { useState } from 'react';
import api from '../lib/api';
import { X, Play, RefreshCw, AlertTriangle, CheckCircle, Truck, PackageCheck } from 'lucide-react';

export default function SimulateModal({ shipment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [customActivity, setCustomActivity] = useState('');

  const handleSimulate = async (targetStatus, defaultActivity) => {
    setLoading(true);
    try {
      const res = await api.post(`/shipments/${shipment._id}/simulate`, {
        targetStatus,
        customActivity: customActivity || defaultActivity,
      });
      if (res.data?.success) {
        onSuccess(res.data.shipment);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-amber-400" />
            <h3 className="font-extrabold text-sm">Sandbox Delivery Simulator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-800">Order #{shipment.orderNumber}</p>
            <p className="text-slate-500">
              AWB: <strong className="font-mono text-slate-700">{shipment.courier?.awbNumber || 'N/A'}</strong> &bull; Current Status:{' '}
              <span className="font-bold text-indigo-600">{shipment.status}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Click any milestone below to immediately simulate the courier scan event and advance the live tracking timeline:
          </p>

          <div className="space-y-2">
            <button
              disabled={loading}
              onClick={() => handleSimulate('PICKUP_SCHEDULED', 'Courier pickup completed from seller warehouse')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span>1. Scan Pickup (PICKUP_SCHEDULED)</span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSimulate('IN_TRANSIT', 'Package departed sorting hub towards destination city')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>2. In Transit (Hub Movement)</span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSimulate('OUT_FOR_DELIVERY', 'Out for delivery with rider (Doorstep delivery attempt)')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-amber-600" />
                <span>3. Out for Delivery</span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSimulate('DELIVERED', 'Package delivered successfully to consignee')}
              className="w-full text-left p-2.5 rounded-lg border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/60 flex items-center justify-between text-xs font-bold text-emerald-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>4. Deliver Successfully (DELIVERED)</span>
              </div>
              <span className="text-[10px] text-emerald-600">&rarr;</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleSimulate('NDR_FAILED', 'Delivery Attempt Failed: Customer phone switched off / door locked')}
              className="w-full text-left p-2.5 rounded-lg border border-rose-200 hover:border-rose-500 hover:bg-rose-50/60 flex items-center justify-between text-xs font-bold text-rose-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>5. Trigger Delivery Failure (NDR Exception)</span>
              </div>
              <span className="text-[10px] text-rose-600">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
