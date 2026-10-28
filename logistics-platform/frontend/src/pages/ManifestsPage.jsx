import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FileText, Printer, Calendar, Package, Warehouse, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ManifestsPage() {
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('lxw_token');

  useEffect(() => {
    fetchManifests();
  }, []);

  const fetchManifests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shipments/manifests/all');
      if (res.data?.success) {
        setManifests(res.data.manifests || []);
      }
    } catch (err) {
      console.warn('Manifest fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (manifestId) => {
    const url = `http://localhost:5050/api/v1/shipments/manifest/${manifestId}/print?token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" /> Courier Handover Manifests
          </h2>
          <p className="text-xs text-slate-500">
            Official handover dispatch sheets signed by warehouse managers and courier pickup agents
          </p>
        </div>
        <button
          onClick={fetchManifests}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <p>Loading manifests...</p>
        </div>
      ) : manifests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3 shadow-xs">
          <FileText className="h-10 w-10 mx-auto text-slate-300" />
          <p className="font-extrabold text-sm text-slate-800">No Handover Manifests Generated Yet</p>
          <p className="text-slate-500 max-w-md mx-auto">
            Go to <strong>Shipments</strong>, select 2 or more packages ready for courier pickup, and click <strong>"Generate Handover Manifest"</strong> to create a signed dispatch sheet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {manifests.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 shadow-xs transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Handover Document</span>
                  <h3 className="font-black text-slate-900 text-base font-mono">{m.manifestNumber}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(m.createdAt || m.pickupDate).toLocaleDateString()}</span>
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {m.status || 'HANDED_OVER'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Carrier</p>
                  <p className="font-black text-slate-800 truncate">{m.carrier}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Consignments</p>
                  <p className="font-black text-slate-800">{m.totalShipments} Packages</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                  <p className="font-black text-slate-800">{m.totalWeight} KG</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  Origin: <strong>{m.pickupLocation?.locationNickname || 'Warehouse'}</strong>
                </span>

                <button
                  onClick={() => handlePrint(m._id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
