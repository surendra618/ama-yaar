import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { getMediaUrl } from '../../../utils/mediaUrl';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function SizeChartModal({
  isOpen,
  onClose,
  product = {},
}) {
  const rawPdf = product?.sizeChartPdf || '/sizing-chart.pdf';
  const resolvedPdfUrl = rawPdf.startsWith('http') || rawPdf.startsWith('/')
    ? (rawPdf.startsWith('/uploads') ? getMediaUrl(rawPdf) : rawPdf)
    : getMediaUrl(rawPdf);

  // Convert http://localhost:5000/uploads/... to relative /uploads/... so Vite/ngrok proxy serves it over HTTPS
  const pdfUrl = resolvedPdfUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');

  const imageUrl = product?.sizeChartImage ? getMediaUrl(product.sizeChartImage) : null;
  const showImageOnly = !product?.sizeChartPdf && !!imageUrl;

  const pagesContainerRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Fetch and render PDF pages directly onto <canvas> so mobile browsers (Android/iOS) show it inline
  useEffect(() => {
    if (!isOpen || showImageOnly || !pdfUrl) {
      setBlobUrl('');
      setPdfError(false);
      return;
    }

    let cancelled = false;
    let objectUrl = '';
    const controller = new AbortController();

    setLoadingPdf(true);
    setPdfError(false);

    (async () => {
      try {
        const res = await fetch(pdfUrl, {
          signal: controller.signal,
          headers: { 'ngrok-skip-browser-warning': '1' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(objectUrl);

        const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) return;

        const container = pagesContainerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const renderScale = Math.max(1.5, dpr * 1.25);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += 1) {
          const page = await pdfDoc.getPage(pageNum);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'w-full h-auto block mx-auto bg-white';

          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          container.appendChild(canvas);
        }
      } catch (err) {
        if (!cancelled && err?.name !== 'AbortError') {
          setPdfError(true);
        }
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (pagesContainerRef.current) {
        pagesContainerRef.current.innerHTML = '';
      }
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150"
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
        <div className="relative flex-1 w-full bg-white overflow-y-auto">
          {showImageOnly ? (
            <div className="flex w-full items-center justify-center p-3 sm:p-4 bg-white">
              <img
                src={imageUrl}
                alt="Product Sizing Chart"
                className="max-h-[82vh] w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full min-h-[260px] bg-white">
              {loadingPdf && (
                <div className="flex h-64 w-full items-center justify-center bg-white">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                </div>
              )}
              {pdfError && !loadingPdf && (
                <div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-xs font-semibold text-neutral-600">
                    Unable to preview sizing chart inline.
                  </p>
                  <a
                    href={blobUrl || pdfUrl}
                    download="amayaar-sizing-chart.pdf"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </a>
                </div>
              )}
              <div
                ref={pagesContainerRef}
                className={`w-full divide-y divide-neutral-200 ${loadingPdf || pdfError ? 'hidden' : 'block'}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
