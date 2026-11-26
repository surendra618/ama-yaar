import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { getMediaUrl } from '../../../utils/mediaUrl';

export default function SizeChartModal({
  isOpen,
  onClose,
  product = {},
}) {
  const rawPdf = product?.sizeChartPdf || '/sizing-chart.pdf';
  const resolvedPdfUrl = rawPdf.startsWith('http') || rawPdf.startsWith('/')
    ? (rawPdf.startsWith('/uploads') ? getMediaUrl(rawPdf) : rawPdf)
    : getMediaUrl(rawPdf);

  // If stored as http://localhost:5000/uploads/..., convert to relative /uploads/... so Vite/ngrok proxy serves it over HTTPS
  const pdfUrl = resolvedPdfUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');

  const imageUrl = product?.sizeChartImage ? getMediaUrl(product.sizeChartImage) : null;
  const showImageOnly = !product?.sizeChartPdf && !!imageUrl;

  const [blobUrl, setBlobUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Fetch PDF as a same-origin Blob URL so X-Frame-Options / Content-Disposition never blocks preview
  useEffect(() => {
    if (!isOpen || showImageOnly || !pdfUrl) {
      setBlobUrl('');
      return;
    }

    let revoked = false;
    let objectUrl = '';
    const controller = new AbortController();

    setLoadingPdf(true);
    fetch(pdfUrl, {
      signal: controller.signal,
      headers: { 'ngrok-skip-browser-warning': '1' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!revoked) setBlobUrl('');
      })
      .finally(() => {
        if (!revoked) setLoadingPdf(false);
      });

    return () => {
      revoked = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, showImageOnly, pdfUrl]);

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

  const iframeSrc = blobUrl
    ? `${blobUrl}#toolbar=0&navpanes=0&view=FitH`
    : `${pdfUrl}#toolbar=0&navpanes=0&view=FitH`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] h-[88vh] rounded-2xl bg-white shadow-2xl flex flex-col border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Action Icons (Download & Close) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <a
            href={showImageOnly ? imageUrl : (blobUrl || pdfUrl)}
            download={showImageOnly ? 'amayaar-sizing-chart.png' : 'amayaar-sizing-chart.pdf'}
            className="rounded-full bg-white/90 p-1.5 text-neutral-600 shadow-md ring-1 ring-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
            title="Download Sizing Chart"
            aria-label="Download size chart"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/90 p-1.5 text-neutral-600 shadow-md ring-1 ring-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
            aria-label="Close size chart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Direct Print / Content View (No Header or Footer) */}
        <div className="relative flex-1 w-full bg-white overflow-hidden flex flex-col">
          {showImageOnly ? (
            <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto bg-white">
              <img
                src={imageUrl}
                alt="Product Sizing Chart"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : loadingPdf ? (
            <div className="flex-1 w-full flex items-center justify-center bg-white">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
            </div>
          ) : (
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              title="Sizing Chart"
              className="w-full h-full flex-1 border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
