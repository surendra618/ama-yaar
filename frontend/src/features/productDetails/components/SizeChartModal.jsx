import { useEffect, useState } from 'react';
import { X, FileText, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../../../utils/mediaUrl';

export default function SizeChartModal({
  isOpen,
  onClose,
  product = {},
}) {
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'image'

  const rawPdf = product?.sizeChartPdf || '/sizing-chart.pdf';
  const pdfUrl = rawPdf.startsWith('http') || rawPdf.startsWith('/')
    ? (rawPdf.startsWith('/uploads') ? getMediaUrl(rawPdf) : rawPdf)
    : getMediaUrl(rawPdf);

  const imageUrl = product?.sizeChartImage ? getMediaUrl(product.sizeChartImage) : null;

  // Lock background scroll when modal is open
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] h-[88vh] rounded-2xl bg-white shadow-2xl flex flex-col border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 sm:px-6 py-3.5 shrink-0 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-900">
                  Sizing Chart &amp; Fit Guide
                </h3>
                <span className="hidden sm:inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                  PDF
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                {product?.brand || 'AMAYAAR'} • Official Streetwear Sizing Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher (if product also has an image) */}
            {imageUrl && (
              <div className="flex items-center rounded-lg bg-neutral-200 p-0.5 mr-2">
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'pdf'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'image'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Image</span>
                </button>
              </div>
            )}

            {/* Open in New Tab Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 hover:text-black transition shadow-2xs"
              title="Open PDF in new window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>

            {/* Download PDF Button */}
            <a
              href={pdfUrl}
              download="amayaar-sizing-chart.pdf"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 hover:text-black transition shadow-2xs"
              title="Download Sizing Chart PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 transition cursor-pointer ml-1"
              aria-label="Close size chart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport: Directly Renders the PDF */}
        <div className="relative flex-1 w-full bg-neutral-100 overflow-hidden flex flex-col">
          {viewMode === 'pdf' ? (
            <div className="relative w-full h-full flex-1 flex flex-col">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                title="Sizing Chart PDF Viewer"
                className="w-full h-full flex-1 border-0 bg-white"
              />

              {/* Mobile / Fallback banner in case browser blocks iframe PDF rendering */}
              <div className="sm:hidden border-t border-neutral-200 bg-white px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500 font-medium">
                  Can't view PDF above?
                </span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black underline flex items-center gap-1"
                >
                  Open PDF Directly <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto bg-neutral-900">
              <img
                src={imageUrl}
                alt="Product Sizing Chart Diagram"
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 sm:px-6 py-3 shrink-0 bg-neutral-50 text-xs">
          <p className="text-[11px] text-neutral-500 font-medium truncate pr-2">
            {product?.modelInfo || "Model is 5'8\" (172 cm), 70 kg, Wearing M Size."}{' '}
            • Free 7-day size exchange available on all orders.
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
            >
              Open Fullscreen PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
