import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Code2, Key, Copy, Check, RefreshCw, Terminal, ExternalLink, Download, FileSpreadsheet } from 'lucide-react';

export default function DeveloperApiPage() {
  const { merchant } = useAuth();
  const [copiedKey, setCopiedKey] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [apiKeys, setApiKeys] = useState(merchant?.apiKeys || {});

  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API Secret? Any active integration using the old secret will break.')) return;
    setRegenerating(true);
    try {
      const res = await api.post('/auth/regenerate-keys');
      if (res.data?.success) {
        setApiKeys(res.data.apiKeys);
        alert('API keys regenerated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate keys');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPostmanCollection = () => {
    const postman = {
      info: {
        name: 'LogixWave OS Logistics API',
        description: 'Official API collection for LogixWave Multi-Carrier Logistics Aggregator',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [
        {
          name: '1. Pincode Serviceability & Rates (GET)',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: 'http://localhost:5050/api/v1/rates/serviceability?deliveryPin=560038&pickupPin=226010&weight=0.5&cod=1&amount=1499',
              protocol: 'http',
              host: ['localhost'],
              port: '5050',
              path: ['api', 'v1', 'rates', 'serviceability'],
              query: [
                { key: 'deliveryPin', value: '560038' },
                { key: 'pickupPin', value: '226010' },
                { key: 'weight', value: '0.5' },
                { key: 'cod', value: '1' },
                { key: 'amount', value: '1499' },
              ],
            },
          },
        },
        {
          name: '2. Rate Comparison (POST)',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                pickupPin: '226010',
                deliveryPin: '560038',
                weight: 0.5,
                length: 25,
                breadth: 20,
                height: 5,
                isCod: true,
                collectableAmount: 1499,
              }, null, 2),
            },
            url: {
              raw: 'http://localhost:5050/api/v1/rates/compare',
              protocol: 'http',
              host: ['localhost'],
              port: '5050',
              path: ['api', 'v1', 'rates', 'compare'],
            },
          },
        },
        {
          name: '3. Create Shipment (API Auth)',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'x-client-id', value: apiKeys.clientId || 'YOUR_CLIENT_ID' },
              { key: 'x-api-key', value: apiKeys.apiKey || 'YOUR_API_SECRET' },
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                orderNumber: 'AY-POSTMAN-' + Date.now().toString().slice(-4),
                buyer: {
                  name: 'Rahul Sharma',
                  phone: '9811223344',
                  email: 'rahul@example.com',
                  addressLine1: 'B-44, Sector 62',
                  city: 'Noida',
                  state: 'Uttar Pradesh',
                  pincode: '201301',
                },
                packageDetails: { deadWeight: 0.5, length: 25, breadth: 20, height: 5 },
                payment: { mode: 'COD', collectableAmount: 1499, subtotal: 1499 },
              }, null, 2),
            },
            url: {
              raw: 'http://localhost:5050/api/v1/shipments',
              protocol: 'http',
              host: ['localhost'],
              port: '5050',
              path: ['api', 'v1', 'shipments'],
            },
          },
        },
        {
          name: '4. Bulk Create Shipments',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'x-client-id', value: apiKeys.clientId || 'YOUR_CLIENT_ID' },
              { key: 'x-api-key', value: apiKeys.apiKey || 'YOUR_API_SECRET' },
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                shipments: [
                  {
                    orderNumber: 'BATCH-001',
                    buyer: { name: 'Priya Patel', phone: '9820011223', addressLine1: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
                    packageDetails: { deadWeight: 0.5, length: 20, breadth: 15, height: 5 },
                    payment: { mode: 'PREPAID', subtotal: 1999 },
                  },
                ],
              }, null, 2),
            },
            url: {
              raw: 'http://localhost:5050/api/v1/shipments/bulk',
              protocol: 'http',
              host: ['localhost'],
              port: '5050',
              path: ['api', 'v1', 'shipments', 'bulk'],
            },
          },
        },
        {
          name: '5. Public Tracking by AWB',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: 'http://localhost:5050/api/v1/track/DEL14389278912',
              protocol: 'http',
              host: ['localhost'],
              port: '5050',
              path: ['api', 'v1', 'track', 'DEL14389278912'],
            },
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(postman, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LogixWave-OS-Postman-Collection.json';
    a.click();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-600" /> Developer APIs &amp; Integrations
          </h2>
          <p className="text-xs text-slate-500">
            Connect your custom eCommerce store (AMA YAAR, Shopify, WooCommerce) via REST APIs
          </p>
        </div>

        <button
          onClick={handleDownloadPostmanCollection}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
        >
          <Download className="h-4 w-4 text-amber-400" />
          <span>Download Postman Collection</span>
        </button>
      </div>

      {/* API Credentials Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" /> Your Production API Credentials
            </h3>
            <p className="text-xs text-slate-500">Pass these headers in your backend HTTP requests</p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate API Secret'}
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Client ID (Header: <span className="font-mono text-indigo-600">x-client-id</span>)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <code className="font-mono text-slate-800 flex-1">{apiKeys.clientId || 'lxw_live_client_id'}</code>
              <button
                onClick={() => handleCopy(apiKeys.clientId || 'lxw_live_client_id', 'clientId')}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition cursor-pointer text-slate-600"
              >
                {copiedKey === 'clientId' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              API Secret Key (Header: <span className="font-mono text-indigo-600">x-api-key</span>)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <code className="font-mono text-slate-800 flex-1">{apiKeys.apiKey || 'sec_live_api_secret'}</code>
              <button
                onClick={() => handleCopy(apiKeys.apiKey || 'sec_live_api_secret', 'apiKey')}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition cursor-pointer text-slate-600"
              >
                {copiedKey === 'apiKey' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint 1: Pincode Serviceability */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-600" />
            <h4 className="font-bold text-xs text-slate-900">Check Pincode Serviceability &amp; Estimated Delivery Date</h4>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            GET /api/v1/rates/serviceability
          </span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X GET "http://localhost:5050/api/v1/rates/serviceability?deliveryPin=560038&pickupPin=226010&weight=0.5&cod=1&amount=1499"`}
        </pre>
      </div>

      {/* Endpoint 2: Create Order via cURL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600" />
            <h4 className="font-bold text-xs text-slate-900">Push Single Order to LogixWave OS</h4>
          </div>
          <span className="text-[11px] text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            POST /api/v1/shipments
          </span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST "http://localhost:5050/api/v1/shipments" \\
  -H "Content-Type: application/json" \\
  -H "x-client-id: ${apiKeys.clientId || 'YOUR_CLIENT_ID'}" \\
  -H "x-api-key: ${apiKeys.apiKey || 'YOUR_API_SECRET'}" \\
  -d '{
    "orderNumber": "AY-99881",
    "buyer": {
      "name": "Rahul Verma",
      "phone": "9811223344",
      "addressLine1": "B-44, Sector 62",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201301"
    },
    "payment": {
      "mode": "COD",
      "collectableAmount": 1499
    },
    "packageDetails": {
      "deadWeight": 0.5,
      "length": 25,
      "breadth": 20,
      "height": 5
    }
  }'`}
        </pre>
      </div>
    </div>
  );
}
