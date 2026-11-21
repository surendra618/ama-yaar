import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import api from '../../../lib/axios';

const FALLBACK_SAMPLE_CSV = `"Product Name","SKU / Product ID","Brand","Product Type","Category","Sub-Category","Selling Price (₹)","MRP (₹)","Total Stock","XS","S","M","L","XL","XXL","3XL","Free Size","Image URLs","Description","Detailed Description","Key Features","Fabric","GSM","Fit","Country of Origin","Wash Care","Whats on Print","Styling Tip","Model Info","Size Chart Type","Featured","Active Status"
"Vintage Oversized Acid Wash Heavyweight Tee","AY-TEE-001","AMAYAAR","T-Shirts","Oversized T-Shirts","Acid Wash",899,1799,35,3,7,12,8,5,0,0,0,"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800, https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800","High-density vintage wash graphic streetwear t-shirt with relaxed dropped shoulders.","Engineered from 280 GSM luxury combed cotton with custom stone-wash distress effect and double-needle collar ribbing.","280 GSM Terry Cotton | Vintage Acid Mineral Wash | Drop Shoulder Fit | High Density Puff Print | Bio-Washed Pre-Shrunk","100% Super Combed Terry Cotton","280 GSM","Oversized Streetwear Fit","India","Machine wash cold inside out, do not bleach, warm iron on reverse","High-density Japanese typography & distressed Cyber-Street artwork","Pair with wide-leg relaxed cargo pants and chunky skate sneakers","Model is 5'10\\" (178 cm), 72 kg, wearing Size M","tops","TRUE","TRUE"
"Men's Cuban Collar Textured Linen Resort Shirt","AY-SHT-102","AMAYAAR","Shirts","Casual Shirts","Cuban Collar",1299,2499,28,0,6,10,8,4,0,0,0,"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800, https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800","Textured breathable resort collar shirt crafted for summer layering and effortless style.","Woven with fine textured linen-cotton blend featuring relaxed open camp collar and shell buttons.","Breathable Linen-Cotton Weave | Camp Cuban Collar | Side Hem Slits | Natural Coconut Shell Buttons","60% Cotton, 40% Linen","180 GSM","Relaxed Boxy Fit","India","Hand wash cold or gentle cycle, line dry in shade, warm iron","Solid Textured Slub Weave","Layer open over a ribbed white tank top with tailored linen shorts","Model is 6'0\\" (183 cm), 75 kg, wearing Size L","tops","TRUE","TRUE"
"Heavyweight Utility Multi-Pocket Cargo Parachute Pants","AY-CAR-301","AMAYAAR","Bottoms","Cargo Pants","Parachute Pants",1799,3499,20,0,4,8,6,2,0,0,0,"https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800","Multi-pocket tactical cargo trousers with adjustable bungee drawcords at hems.","Heavy duty ripstop cotton with articulated knee darts, 6 functional cargo pockets, and elasticated waist.","Durable Cotton Ripstop | 6 Tactical Utility Pockets | Bungee Cinch Hems | Key D-Ring Loop","100% Cotton Ripstop","320 GSM","Baggy Parachute Fit","India","Machine wash cold inside out with similar colors","Minimalist tonal brand embroidery on cargo flap","Pair with an oversized hoodie and retro runner sneakers","Model is 5'11\\" (180 cm), 70 kg, wearing Size M","bottoms","FALSE","TRUE"
"Thermal Waffle Knit Heavyweight Fleece Pullover","AY-HOD-405","AMAYAAR","Hoodies & Sweats","Pullovers","Thermal Fleece",1499,2999,24,2,6,8,6,2,0,0,0,"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800","Cozy heavyweight waffle textured thermal fleece pullover with dropped shoulders.","Heavy-knit thermal fabric with soft brushed interior, ribbed cuffs, and minimal aesthetic.","340 GSM Thermal Waffle Knit | Brushed Fleece Lining | Ribbed Collar & Cuffs | Relaxed Drop-Shoulder Silhouette","80% Cotton, 20% Polyester","340 GSM","Relaxed Streetwear Fit","India","Machine wash gentle in cold water, do not tumble dry, dry flat","Tonal high-density chest logo badge","Wear with wide-leg distressed denim and chunky boots","Model is 6'1\\" (185 cm), 78 kg, wearing Size L","tops","TRUE","TRUE"
`;

export default function BulkImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showFieldsGuide, setShowFieldsGuide] = useState(false);
  const inputRef = useRef(null);

  if (!open) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith('.xlsx') ||
        droppedFile.name.endsWith('.xls') ||
        droppedFile.name.endsWith('.csv')
      ) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload an Excel (.xlsx / .xls) or CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDownloadSample = async (format = 'xlsx') => {
    setDownloadingFormat(format);
    try {
      const response = await api.get(`/products/sample-template?format=${format}`, {
        responseType: 'blob',
      });
      const mime =
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8;';
      const blob = new Blob([response.data], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `amayaar_products_bulk_sample.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Backend template download failed, falling back to client-side sample CSV:', err);
      // Fallback to client-side generated CSV
      const blob = new Blob([FALLBACK_SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `amayaar_products_bulk_sample.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel or CSV file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data?.data || { totalProcessed: 0 });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to process file. Please ensure columns match the required format.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-gradient-to-r from-slate-50 to-slate-100/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bulk Import Products</h3>
              <p className="text-xs text-slate-500">
                Upload Excel (<span className="font-mono text-emerald-700 font-semibold">.xlsx</span>) or CSV with automatic category & variant mapping
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4.5 overflow-y-auto">
          {/* Success Banner */}
          {result && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4.5 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Import Completed Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Processed <strong>{result.totalProcessed}</strong> products ({result.createdCount} new products added, {result.updatedCount} existing updated). Categories, SKUs, sizes, and images have been synchronized.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 flex items-start gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Template Download Section */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Download className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Download Sample Import Template</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Pre-filled with realistic sample products covering all fields, sizes, and image URL examples.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadSample('xlsx')}
                  disabled={downloadingFormat === 'xlsx'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                  title="Download full Excel format with columns & instructions sheet"
                >
                  {downloadingFormat === 'xlsx' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  )}
                  <span>Sample Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSample('csv')}
                  disabled={downloadingFormat === 'csv'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                  title="Download standard CSV format"
                >
                  {downloadingFormat === 'csv' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Tips on Key Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/50 text-[11px] text-slate-700">
              <div className="flex items-start gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Image URLs:</strong> Paste direct URLs. For multiple images, separate with a comma (<code>,</code>).
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">All Sizes:</strong> Columns for XS, S, M, L, XL, XXL, 3XL, and Free Size with individual stock counts.
                </span>
              </div>
            </div>
          </div>

          {/* Dropzone */}
          {!result && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : file
                  ? 'border-indigo-400 bg-indigo-50/30'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-3 shadow-xs ${
                  file ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-emerald-600'
                }`}
              >
                {file ? <FileSpreadsheet className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Drag and drop your Excel (.xlsx) or CSV file here
                  </p>
                  <p className="text-xs text-slate-400">or click to browse from your computer (up to 25MB)</p>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Column Guide Toggle */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <button
              type="button"
              onClick={() => setShowFieldsGuide(!showFieldsGuide)}
              className="flex items-center justify-between w-full text-left font-semibold text-xs text-slate-700 hover:text-slate-900 transition"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                <span>Field Reference & Supported Columns ({showFieldsGuide ? 'Hide' : 'Show Details'})</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600">
                {showFieldsGuide ? 'Contract ▲' : 'Expand ▼'}
              </span>
            </button>

            {showFieldsGuide && (
              <div className="mt-3 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-2 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block">1. Product Identity</span>
                    <code>Product Name</code> (Required), <code>SKU / Product ID</code>, <code>Brand</code>, <code>Product Type</code>, <code>Category</code>, <code>Sub-Category</code>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block">2. Pricing & Stock</span>
                    <code>Selling Price (₹)</code> (Required), <code>MRP (₹)</code>, <code>Total Stock</code>, <code>XS</code>, <code>S</code>, <code>M</code>, <code>L</code>, <code>XL</code>, <code>XXL</code>, <code>3XL</code>, <code>Free Size</code>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block">3. Media & Visuals</span>
                    <code>Image URLs</code>: Multiple images comma-separated (e.g. <code>url1, url2</code>). Cloudinary, Unsplash, Google Drive, and Dropbox links work directly.
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block">4. Fabric, Specs & Fit</span>
                    <code>Fabric</code>, <code>GSM</code>, <code>Fit</code>, <code>Country of Origin</code>, <code>Wash Care</code>, <code>Whats on Print</code>, <code>Styling Tip</code>, <code>Model Info</code>, <code>Size Chart Type</code> (<code>tops</code> / <code>bottoms</code>)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/70 shrink-0">
          <div className="text-[11px] text-slate-400">
            {file ? `Ready to import: ${file.name}` : 'Select a file to begin import'}
          </div>

          <div className="flex items-center gap-2.5">
            {result ? (
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
              >
                Done & View Products
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4.5 py-2 text-xs font-bold text-white shadow-xs transition ${
                    !file || loading
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Importing & Categorizing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload & Import</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
