import { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';
import getMediaUrl from '../../../utils/mediaUrl';

export default function SizeChartPreviewModal({
  isOpen,
  onClose,
  product = {},
}) {
  const [viewMode, setViewMode] = useState('pdf');

  const rawPdf = product?.sizeChartPdf || '/sizing-chart.pdf';
  const pdfUrl = rawPdf.startsWith('http') || rawPdf.startsWith('/')
    ? (rawPdf.startsWith('/uploads') ? getMediaUrl(rawPdf) : rawPdf)
    : getMediaUrl(rawPdf);

  const imageUrl = product?.sizeChartImage ? getMediaUrl(product.sizeChartImage) : null;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] h-[88vh] rounded-2xl bg-white shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900">
                  Customer Sizing Chart Preview (PDF)
                </h3>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                  Live View
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {product?.brand || 'AMAYAAR'} • Official Streetwear Sizing Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <div className="flex items-center rounded-lg bg-slate-200 p-0.5 mr-2">
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'pdf' ? 'bg-black text-white shadow-xs' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'image' ? 'bg-black text-white shadow-xs' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Image</span>
                </button>
              </div>
            )}

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-black transition shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF */}
        <div className="relative flex-1 w-full bg-slate-100 overflow-hidden flex flex-col">
          {viewMode === 'pdf' ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Sizing Chart PDF Preview"
              className="w-full h-full flex-1 border-0 bg-white"
            />
          ) : (
            <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto bg-slate-900">
              <img
                src={imageUrl}
                alt="Product Sizing Chart Diagram"
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 shrink-0 bg-slate-50 text-xs">
          <p className="text-[11px] text-slate-500 font-medium">
            Active PDF: <code className="font-mono text-slate-800">{rawPdf}</code>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
