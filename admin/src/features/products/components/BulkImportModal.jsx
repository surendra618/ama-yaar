import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';

const SAMPLE_CSV = `Product Type,Category,Sub-Category,Product name,Small,Medium,Large,XL,Cost Price (₹),Selling Price (₹),Total Pieces,Image URL
Shirts,BOXY-FIT Shirts,Check Design,BLACK WITH MAROON RED WHITE CHECKS,0,1,0,0,500,999,1,https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800
,,,DARK GREY WITH MAROON RED & WHITE CHECKS,0,1,0,0,500,999,1,https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800
,,,Plain Design,BEIGE,0,1,1,1,500,999,3,https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800
T-Shirts,Fleece henley,,BLACK,0,1,0,1,350,699,2,https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800
,,Polo t-Shirts,Gucci,BLACK,0,0,1,0,400,799,1,https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800
`;

export default function BulkImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
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

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'amayaar_product_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bulk Import Products</h3>
              <p className="text-xs text-slate-500">Upload Excel (.xlsx, .xls) or CSV sheet</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Banner */}
          {result && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Import Completed Successfully!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Processed <strong>{result.totalProcessed}</strong> products ({result.createdCount} new created, {result.updatedCount} updated). All categories & sizes were automatically synchronized.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-900 flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : file
                  ? 'border-indigo-400 bg-indigo-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 mb-3">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB &bull; Click to choose another file
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse or drag & drop your Excel/CSV here
                  </p>
                  <p className="text-xs text-slate-400">Supports .xlsx, .xls, and .csv files up to 25MB</p>
                </div>
              )}
            </div>
          )}

          {/* Information Notice & Sample Template */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-800">Auto-Categorization Enabled:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically detects Product Type, Categories, Sizes (S, M, L, XL), & In-Stock counts.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 transition shrink-0 ml-3 py-1 px-2 rounded-md hover:bg-indigo-50"
            >
              <Download className="h-3.5 w-3.5" /> Sample Template
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          {result ? (
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
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
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs transition ${
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
  );
}
