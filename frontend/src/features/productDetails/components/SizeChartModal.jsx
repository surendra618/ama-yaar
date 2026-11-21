import { useState, useEffect } from 'react';
import { X, Ruler, Check, Info, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../../../utils/mediaUrl';

// Sizing data for Tops (Oversized & Standard Streetwear)
const TOPS_SIZES = [
  {
    size: 'XS',
    chestIn: '38',
    lengthIn: '27',
    shoulderIn: '18.5',
    sleeveIn: '8.5',
    chestCm: '96',
    lengthCm: '68.5',
    shoulderCm: '47',
    sleeveCm: '21.5',
  },
  {
    size: 'S',
    chestIn: '40',
    lengthIn: '28',
    shoulderIn: '19.5',
    sleeveIn: '9.0',
    chestCm: '101.5',
    lengthCm: '71',
    shoulderCm: '49.5',
    sleeveCm: '23',
  },
  {
    size: 'M',
    chestIn: '42',
    lengthIn: '29',
    shoulderIn: '20.5',
    sleeveIn: '9.5',
    chestCm: '106.5',
    lengthCm: '73.5',
    shoulderCm: '52',
    sleeveCm: '24',
  },
  {
    size: 'L',
    chestIn: '44',
    lengthIn: '30',
    shoulderIn: '21.5',
    sleeveIn: '10.0',
    chestCm: '112',
    lengthCm: '76',
    shoulderCm: '54.5',
    sleeveCm: '25.5',
  },
  {
    size: 'XL',
    chestIn: '46',
    lengthIn: '31',
    shoulderIn: '22.5',
    sleeveIn: '10.5',
    chestCm: '117',
    lengthCm: '78.5',
    shoulderCm: '57',
    sleeveCm: '26.5',
  },
  {
    size: 'XXL',
    chestIn: '48',
    lengthIn: '32',
    shoulderIn: '23.5',
    sleeveIn: '11.0',
    chestCm: '122',
    lengthCm: '81',
    shoulderCm: '59.5',
    sleeveCm: '28',
  },
  {
    size: '3XL',
    chestIn: '50',
    lengthIn: '33',
    shoulderIn: '24.5',
    sleeveIn: '11.5',
    chestCm: '127',
    lengthCm: '84',
    shoulderCm: '62',
    sleeveCm: '29',
  },
];

// Sizing data for Bottoms (Pants, Cargos, Jeans, Joggers)
const BOTTOMS_SIZES = [
  {
    size: '28 (XS)',
    waistIn: '28 - 29',
    hipIn: '38',
    lengthIn: '39',
    inseamIn: '28',
    waistCm: '71 - 74',
    hipCm: '96.5',
    lengthCm: '99',
    inseamCm: '71',
  },
  {
    size: '30 (S)',
    waistIn: '30 - 31',
    hipIn: '40',
    lengthIn: '40',
    inseamIn: '29',
    waistCm: '76 - 79',
    hipCm: '101.5',
    lengthCm: '101.5',
    inseamCm: '73.5',
  },
  {
    size: '32 (M)',
    waistIn: '32 - 33',
    hipIn: '42',
    lengthIn: '41',
    inseamIn: '30',
    waistCm: '81 - 84',
    hipCm: '106.5',
    lengthCm: '104',
    inseamCm: '76',
  },
  {
    size: '34 (L)',
    waistIn: '34 - 35',
    hipIn: '44',
    lengthIn: '42',
    inseamIn: '30.5',
    waistCm: '86 - 89',
    hipCm: '112',
    lengthCm: '106.5',
    inseamCm: '77.5',
  },
  {
    size: '36 (XL)',
    waistIn: '36 - 37',
    hipIn: '46',
    lengthIn: '42.5',
    inseamIn: '31',
    waistCm: '91 - 94',
    hipCm: '117',
    lengthCm: '108',
    inseamCm: '78.5',
  },
  {
    size: '38 (XXL)',
    waistIn: '38 - 39',
    hipIn: '48',
    lengthIn: '43',
    inseamIn: '31.5',
    waistCm: '96 - 99',
    hipCm: '122',
    lengthCm: '109',
    inseamCm: '80',
  },
];

export default function SizeChartModal({
  isOpen,
  onClose,
  selectedSize,
  product = {},
  onSelectSize,
}) {
  const [unit, setUnit] = useState('in'); // 'in' | 'cm'
  const [activeTab, setActiveTab] = useState('tops'); // 'tops' | 'bottoms'

  // Determine default tab based on product category, type or custom image
  useEffect(() => {
    if (!product) return;
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

    const catName = (product.category?.name || product.category?.slug || '').toLowerCase();
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
  }, [product]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col border border-neutral-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Ruler className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-900">
                Sizing Chart & Fit Guide
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                {product.brand || 'AMAYAAR'} • Streetwear Tailored Fit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 transition cursor-pointer"
            aria-label="Close size chart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Controls: Category Tabs & Unit Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3 shrink-0 bg-white">
          {/* Tops vs Bottoms Tab */}
          <div className="flex items-center rounded-lg bg-neutral-100 p-1">
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

          {/* Unit Toggle: INCHES vs CM */}
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

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 text-neutral-800">
          {/* If Visual Diagram Tab */}
          {activeTab === 'image' && product.sizeChartImage && (
            <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <img
                src={getMediaUrl(product.sizeChartImage)}
                alt="Product Sizing Chart"
                className="max-h-[50vh] w-auto object-contain rounded-md shadow-xs"
              />
            </div>
          )}

          {/* Measurement Table */}
          {activeTab !== 'image' && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            {activeTab === 'tops' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white uppercase text-[11px] font-black tracking-wider">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest / Bust</th>
                    <th className="py-2.5 px-3">Front Length</th>
                    <th className="py-2.5 px-3">Shoulder</th>
                    <th className="py-2.5 px-3">Sleeve</th>
                    {onSelectSize && <th className="py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {TOPS_SIZES.map((row) => {
                    const isCurrent =
                      selectedSize &&
                      selectedSize.toUpperCase() === row.size.toUpperCase();
                    return (
                      <tr
                        key={row.size}
                        className={`transition ${
                          isCurrent
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-black">
                          <span className="flex items-center gap-1.5">
                            {row.size}
                            {isCurrent && (
                              <span className="rounded-full bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2">
                                YOUR SIZE
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.chestIn}"` : `${row.chestCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.sleeveIn}"` : `${row.sleeveCm} cm`}
                        </td>
                        {onSelectSize && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectSize(row.size);
                                onClose();
                              }}
                              className={`rounded px-2 py-1 text-[11px] font-bold uppercase transition ${
                                isCurrent
                                  ? 'bg-white text-black'
                                  : 'bg-neutral-900 text-white hover:bg-black'
                              }`}
                            >
                              {isCurrent ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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
                    {onSelectSize && <th className="py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {BOTTOMS_SIZES.map((row) => {
                    const isCurrent =
                      selectedSize &&
                      (row.size.includes(selectedSize.toUpperCase()) ||
                        selectedSize.toUpperCase() === row.size.split(' ')[0]);
                    return (
                      <tr
                        key={row.size}
                        className={`transition ${
                          isCurrent
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-black">
                          <span className="flex items-center gap-1.5">
                            {row.size}
                            {isCurrent && (
                              <span className="rounded-full bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2">
                                YOUR SIZE
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.waistIn}"` : `${row.waistCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.hipIn}"` : `${row.hipCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {unit === 'in' ? `${row.inseamIn}"` : `${row.inseamCm} cm`}
                        </td>
                        {onSelectSize && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectSize(row.size.split(' ')[0]);
                                onClose();
                              }}
                              className={`rounded px-2 py-1 text-[11px] font-bold uppercase transition ${
                                isCurrent
                                  ? 'bg-white text-black'
                                  : 'bg-neutral-900 text-white hover:bg-black'
                              }`}
                            >
                              {isCurrent ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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

          {/* How to Measure Instructions */}
          <div className="space-y-2 pt-1 border-t border-neutral-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <span>How To Measure Correctly</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-600">
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">1. Chest / Bust</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure around the fullest part of your chest, keeping the tape comfortably horizontal under your arms.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">2. Garment Length</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure straight down from the highest point of the shoulder seam to the bottom hemline.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">3. Shoulder Width</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Measure straight across the upper back from the tip of one shoulder seam to the other.
                </p>
              </div>
              <div className="rounded-md border border-neutral-100 bg-neutral-50/50 p-2.5">
                <p className="font-bold text-neutral-800 text-[11px]">4. Sleeve / Waist</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  For sleeves, measure from shoulder to cuff. For bottoms, measure around where your waistband naturally sits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 shrink-0 bg-neutral-50">
          <span className="text-[11px] text-neutral-500 font-medium">
            Need sizing assistance? Free 7-day size exchange available.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
