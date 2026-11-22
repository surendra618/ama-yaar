import { useState, useEffect } from 'react';
import { X, Ruler, Info, Image as ImageIcon } from 'lucide-react';
import getMediaUrl from '../../../utils/mediaUrl';

const TOPS_SIZES = [
  { size: 'XS', chestIn: '38', lengthIn: '27', shoulderIn: '18.5', sleeveIn: '8.5', chestCm: '96', lengthCm: '68.5', shoulderCm: '47', sleeveCm: '21.5' },
  { size: 'S', chestIn: '40', lengthIn: '28', shoulderIn: '19.5', sleeveIn: '9.0', chestCm: '101.5', lengthCm: '71', shoulderCm: '49.5', sleeveCm: '23' },
  { size: 'M', chestIn: '42', lengthIn: '29', shoulderIn: '20.5', sleeveIn: '9.5', chestCm: '106.5', lengthCm: '73.5', shoulderCm: '52', sleeveCm: '24' },
  { size: 'L', chestIn: '44', lengthIn: '30', shoulderIn: '21.5', sleeveIn: '10.0', chestCm: '112', lengthCm: '76', shoulderCm: '54.5', sleeveCm: '25.5' },
  { size: 'XL', chestIn: '46', lengthIn: '31', shoulderIn: '22.5', sleeveIn: '10.5', chestCm: '117', lengthCm: '78.5', shoulderCm: '57', sleeveCm: '26.5' },
  { size: 'XXL', chestIn: '48', lengthIn: '32', shoulderIn: '23.5', sleeveIn: '11.0', chestCm: '122', lengthCm: '81', shoulderCm: '59.5', sleeveCm: '28' },
  { size: '3XL', chestIn: '50', lengthIn: '33', shoulderIn: '24.5', sleeveIn: '11.5', chestCm: '127', lengthCm: '84', shoulderCm: '62', sleeveCm: '29' },
];

const BOTTOMS_SIZES = [
  { size: '28 (XS)', waistIn: '28 - 29', hipIn: '38', lengthIn: '39', inseamIn: '28', waistCm: '71 - 74', hipCm: '96.5', lengthCm: '99', inseamCm: '71' },
  { size: '30 (S)', waistIn: '30 - 31', hipIn: '40', lengthIn: '40', inseamIn: '29', waistCm: '76 - 79', hipCm: '101.5', lengthCm: '101.5', inseamCm: '73.5' },
  { size: '32 (M)', waistIn: '32 - 33', hipIn: '42', lengthIn: '41', inseamIn: '30', waistCm: '81 - 84', hipCm: '106.5', lengthCm: '104', inseamCm: '76' },
  { size: '34 (L)', waistIn: '34 - 35', hipIn: '44', lengthIn: '42', inseamIn: '30.5', waistCm: '86 - 89', hipCm: '112', lengthCm: '106.5', inseamCm: '77.5' },
  { size: '36 (XL)', waistIn: '36 - 37', hipIn: '46', lengthIn: '42.5', inseamIn: '31', waistCm: '91 - 94', hipCm: '117', lengthCm: '108', inseamCm: '78.5' },
  { size: '38 (XXL)', waistIn: '38 - 39', hipIn: '48', lengthIn: '43', inseamIn: '31.5', waistCm: '96 - 99', hipCm: '122', lengthCm: '109', inseamCm: '80' },
];

export default function SizeChartPreviewModal({
  isOpen,
  onClose,
  product = {},
  categories = [],
}) {
  const [unit, setUnit] = useState('in'); // 'in' | 'cm'
  const [activeTab, setActiveTab] = useState('tops'); // 'tops' | 'bottoms' | 'custom' | 'image'

  const customRows = Array.isArray(product?.customSizeChart) ? product.customSizeChart : [];
  const hasCustomChart =
    (product?.sizeChartType === 'custom' || customRows.length > 0) && customRows.length > 0;
  const hasChest = customRows.some((r) => r.chest && String(r.chest).trim());
  const hasLength = customRows.some((r) => r.length && String(r.length).trim());
  const hasShoulder = customRows.some((r) => r.shoulder && String(r.shoulder).trim());
  const hasSleeve = customRows.some((r) => r.sleeve && String(r.sleeve).trim());
  const hasWaist = customRows.some((r) => r.waist && String(r.waist).trim());
  const hasHip = customRows.some((r) => r.hip && String(r.hip).trim());
  const hasInseam = customRows.some((r) => r.inseam && String(r.inseam).trim());

  const formatMeasurement = (val, targetUnit) => {
    if (!val || (typeof val !== 'string' && typeof val !== 'number')) return '—';
    const str = String(val).trim();
    if (!str) return '—';

    if (targetUnit === 'in') {
      return str.endsWith('"') || str.toLowerCase().endsWith('in') ? str : `${str}"`;
    }

    const rangeMatch = str.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
    if (rangeMatch) {
      const c1 = Math.round(parseFloat(rangeMatch[1]) * 2.54 * 10) / 10;
      const c2 = Math.round(parseFloat(rangeMatch[2]) * 2.54 * 10) / 10;
      return `${c1} - ${c2} cm`;
    }
    const singleNum = parseFloat(str.replace(/[^\d.]/g, ''));
    if (!isNaN(singleNum) && singleNum > 0) {
      const cmVal = Math.round(singleNum * 2.54 * 10) / 10;
      return `${cmVal} cm`;
    }
    return str;
  };

  useEffect(() => {
    if (!product) return;
    if (product.sizeChartType === 'custom' && hasCustomChart) {
      setActiveTab('custom');
      return;
    }
    if (product.sizeChartType === 'image' && product.sizeChartImage) {
      setActiveTab('image');
      return;
    }
    if (product.sizeChartType === 'bottoms') {
      setActiveTab('bottoms');
      return;
    }
    if (product.sizeChartType === 'tops') {
      setActiveTab('tops');
      return;
    }

    // Auto category detection
    const catId = product.category?._id || product.category;
    const catDoc = categories.find((c) => (c._id || c.id) === catId);
    const catName = (catDoc?.name || catDoc?.slug || '').toLowerCase();
    const prodName = (product.name || '').toLowerCase();
    const isBottom =
      catName.includes('pant') ||
      catName.includes('cargo') ||
      catName.includes('jean') ||
      catName.includes('lower') ||
      catName.includes('trouser') ||
      catName.includes('short') ||
      prodName.includes('pant') ||
      prodName.includes('cargo') ||
      prodName.includes('jean') ||
      prodName.includes('jogger');

    setActiveTab(isBottom ? 'bottoms' : 'tops');
  }, [product, hasCustomChart, categories]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Ruler className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-900">
                  Sizing Chart & Fit Guide
                </h3>
                <span className="rounded bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  Storefront Preview
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                {product.brand || 'AMAYAAR'} • Streetwear Tailored Fit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 transition cursor-pointer"
            aria-label="Close size chart preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Controls: Category Tabs & Unit Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3 shrink-0 bg-white">
          <div className="flex items-center rounded-lg bg-neutral-100 p-1 flex-wrap gap-1">
            {hasCustomChart && (
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Custom Fit Guide
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('tops')}
              className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === 'tops'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Tops / Tees
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bottoms')}
              className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === 'bottoms'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Bottoms / Pants
            </button>
            {product.sizeChartImage && (
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'image'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Visual Diagram</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 mr-1">Unit:</span>
            <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 bg-neutral-50">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`rounded px-2.5 py-0.5 text-xs font-bold transition cursor-pointer ${
                  unit === 'in'
                    ? 'bg-black text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`rounded px-2.5 py-0.5 text-xs font-bold transition cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-black text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 text-neutral-800">
          {activeTab === 'image' && product.sizeChartImage && (
            <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <img
                src={getMediaUrl(product.sizeChartImage)}
                alt="Product Sizing Chart Preview"
                className="max-h-[50vh] w-auto object-contain rounded-md shadow-xs"
              />
            </div>
          )}

          {activeTab !== 'image' && (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              {activeTab === 'custom' && hasCustomChart ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white uppercase text-[11px] font-black tracking-wider">
                      <th className="py-2.5 px-3">Size</th>
                      {hasChest && <th className="py-2.5 px-3">Chest / Bust</th>}
                      {hasLength && <th className="py-2.5 px-3">Front Length</th>}
                      {hasShoulder && <th className="py-2.5 px-3">Shoulder</th>}
                      {hasSleeve && <th className="py-2.5 px-3">Sleeve</th>}
                      {hasWaist && <th className="py-2.5 px-3">Waist</th>}
                      {hasHip && <th className="py-2.5 px-3">Hip</th>}
                      {hasInseam && <th className="py-2.5 px-3">Inseam</th>}
                      <th className="py-2.5 px-3 text-right">Customer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {customRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 transition">
                        <td className="py-2.5 px-3 font-black text-neutral-900">
                          {row.size || '—'}
                        </td>
                        {hasChest && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.chest, unit)}
                          </td>
                        )}
                        {hasLength && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.length, unit)}
                          </td>
                        )}
                        {hasShoulder && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.shoulder, unit)}
                          </td>
                        )}
                        {hasSleeve && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.sleeve, unit)}
                          </td>
                        )}
                        {hasWaist && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.waist, unit)}
                          </td>
                        )}
                        {hasHip && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.hip, unit)}
                          </td>
                        )}
                        {hasInseam && (
                          <td className="py-2.5 px-3 font-medium text-neutral-700">
                            {formatMeasurement(row.inseam, unit)}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right">
                          <span className="rounded bg-neutral-900 text-white px-2 py-1 text-[10px] font-bold uppercase">
                            Select
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'tops' ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white uppercase text-[11px] font-black tracking-wider">
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest / Bust</th>
                      <th className="py-2.5 px-3">Front Length</th>
                      <th className="py-2.5 px-3">Shoulder</th>
                      <th className="py-2.5 px-3">Sleeve</th>
                      <th className="py-2.5 px-3 text-right">Customer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {TOPS_SIZES.map((row) => (
                      <tr key={row.size} className="hover:bg-neutral-50 transition">
                        <td className="py-2.5 px-3 font-black text-neutral-900">{row.size}</td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.chestIn}"` : `${row.chestCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.sleeveIn}"` : `${row.sleeveCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="rounded bg-neutral-900 text-white px-2 py-1 text-[10px] font-bold uppercase">
                            Select
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-white uppercase text-[11px] font-black tracking-wider">
                      <th className="py-2.5 px-3">Size / Waist</th>
                      <th className="py-2.5 px-3">Waist Span</th>
                      <th className="py-2.5 px-3">Hip</th>
                      <th className="py-2.5 px-3">Outseam Length</th>
                      <th className="py-2.5 px-3">Inseam</th>
                      <th className="py-2.5 px-3 text-right">Customer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {BOTTOMS_SIZES.map((row) => (
                      <tr key={row.size} className="hover:bg-neutral-50 transition">
                        <td className="py-2.5 px-3 font-black text-neutral-900">{row.size}</td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.waistIn}"` : `${row.waistCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.hipIn}"` : `${row.hipCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">
                          {unit === 'in' ? `${row.inseamIn}"` : `${row.inseamCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="rounded bg-neutral-900 text-white px-2 py-1 text-[10px] font-bold uppercase">
                            Select
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Model Fit Info Pill */}
          <div className="flex items-start gap-2.5 rounded-lg bg-neutral-50 p-3 border border-neutral-200">
            <Info className="h-4 w-4 text-neutral-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-900">
                Fit Reference:{' '}
                <span className="font-normal">
                  {product.modelInfo || "Model is 5'8\" (172 cm), 70 kg, Wearing M Size."}
                </span>
              </p>
              <p className="text-[11px] text-neutral-500">
                Silhouettes are relaxed streetwear drops. For an oversized fit, stay true to size. For a tailored regular fit, order one size down.
              </p>
            </div>
          </div>

          {/* How To Measure Correctly */}
          <div className="space-y-2 pt-1 border-t border-neutral-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              How To Measure Correctly
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">1. Chest / Bust</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure around fullest part of chest, keeping tape comfortably horizontal.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">2. Garment Length</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure straight down from shoulder seam to bottom hemline.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">3. Shoulder Width</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure straight across upper back from shoulder tip to shoulder tip.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">4. Sleeve / Waist</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure shoulder to cuff. For bottoms, measure around natural waistband.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 shrink-0 bg-neutral-50">
          <span className="text-[11px] text-neutral-500 font-medium">
            Customer Storefront Preview Mode
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
