import { useState } from 'react';
import api from '../lib/api';
import { Calculator, Star, Clock, Zap, Truck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function RateCalculatorPage() {
  const [pickupPin, setPickupPin] = useState('226010'); // Default Lucknow
  const [deliveryPin, setDeliveryPin] = useState('400050'); // Default Mumbai
  const [weight, setWeight] = useState(0.5);
  const [length, setLength] = useState(25);
  const [breadth, setBreadth] = useState(20);
  const [height, setHeight] = useState(5);
  const [isCod, setIsCod] = useState(false);
  const [collectableAmount, setCollectableAmount] = useState(999);

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/rates/compare', {
        pickupPin,
        deliveryPin,
        length: Number(length),
        breadth: Number(breadth),
        height: Number(height),
        weight: Number(weight),
        isCod,
        collectableAmount: isCod ? Number(collectableAmount) : 0,
      });

      if (res.data?.success) {
        setComparison(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Rate calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-600" /> Multi-Courier Shipping Rate Calculator
        </h2>
        <p className="text-xs text-slate-500">
          Compare freight costs, delivery timelines, and COD surcharges across partner courier networks
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Pincode (Origin)</label>
            <input
              type="text"
              maxLength="6"
              value={pickupPin}
              onChange={(e) => setPickupPin(e.target.value)}
              placeholder="e.g. 226010 (Lucknow)"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Pincode (Destination)</label>
            <input
              type="text"
              maxLength="6"
              value={deliveryPin}
              onChange={(e) => setDeliveryPin(e.target.value)}
              placeholder="e.g. 400050 (Mumbai)"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dead Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Length (cm)</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Breadth (cm)</label>
            <input
              type="number"
              value={breadth}
              onChange={(e) => setBreadth(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isCod}
                onChange={(e) => setIsCod(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Cash on Delivery (COD) Order</span>
            </label>

            {isCod && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Collectable Amount:</span>
                <input
                  type="number"
                  value={collectableAmount}
                  onChange={(e) => setCollectableAmount(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            <span>Compare Live Courier Rates</span>
          </button>
        </div>
      </form>

      {/* Results View */}
      {comparison && (
        <div className="space-y-4 animate-in fade-in">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/70 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-indigo-500">Route Zone</p>
              <p className="font-black text-indigo-950 mt-0.5">{comparison.zone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-indigo-500">Dead Weight</p>
              <p className="font-black text-indigo-950 mt-0.5">{comparison.deadWeightKg} KG</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-indigo-500">Volumetric Weight</p>
              <p className="font-black text-indigo-950 mt-0.5">{comparison.volumetricWeightKg} KG</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-indigo-500">Billable Weight</p>
              <p className="font-black text-indigo-950 mt-0.5">{comparison.billableWeightKg} KG</p>
            </div>
          </div>

          {/* Courier Quote Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.couriers.map((c) => (
              <div
                key={c.carrierId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 p-5 shadow-xs transition space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{c.carrierName}</h4>
                      {c.isCheapest && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          ★ Cheapest
                        </span>
                      )}
                      {c.isFastest && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          ⚡ Fastest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {c.rating}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Delivery by <strong>{c.etdDate}</strong> ({c.etdDays} days)
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 font-mono">₹{c.totalCost}</p>
                    <p className="text-[10px] text-slate-400">All taxes included</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Base Freight: ₹{c.freightCharge}</span>
                  {c.codCharge > 0 && <span className="text-amber-700 font-semibold">+ COD Surcharge: ₹{c.codCharge}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
