import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Check,
  Trash2,
  ListChecks,
  Layers,
  ShieldCheck,
  FileText,
  RotateCcw,
  Eye,
  Tag,
  Ruler,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchCategoriesForSelect,
  fetchProductById,
  createProduct,
  updateProduct,
  clearCurrentProduct,
} from '../productsSlice';
import api from '../../../lib/axios';
import getMediaUrl from '../../../utils/mediaUrl';
import SizeChartPreviewModal from '../components/SizeChartPreviewModal';

const emptyForm = {
  name: '',
  brand: 'AMAYAAR',
  sku: '',
  category: '',
  description: '',
  detailedDescription: '',
  keyFeatures: [],
  fabric: '',
  gsm: '',
  fit: '',
  countryOfOrigin: 'India',
  washCare: '',
  whatsOnPrint: '',
  stylingTip: '',
  exchangePolicy: '',
  exchangeDays: 7,
  modelInfo: '',
  sizeChartType: 'default',
  sizeChartImage: '',
  sizeChartPdf: '',
  customSizeChart: [],
  price: '',
  mrp: '',
  stock: '',
  variants: [],
  images: [],
  isFeatured: false,
  isActive: true,
};

const FEATURE_SUGGESTIONS = [
  '100% Super Combed Terry Cotton',
  'Heavyweight 380 GSM Fabric',
  'Oversized Streetwear Silhouette',
  'Dropped Shoulder Loose Fit',
  'High-Density Screen & Puff Print',
  'Pre-Shrunk Bio-Washed Finish',
  'Reinforced Twin-Needle Stitching',
  'Ribbed Lycra Collar & Hem',
];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, current, saving, error } = useSelector((state) => state.products);

  const [form, setForm] = useState(emptyForm);
  const [urlInput, setUrlInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewTab, setPreviewTab] = useState('card'); // 'card' | 'details' | 'sizeChart'
  const [storefrontActiveTab, setStorefrontActiveTab] = useState('description'); // 'description' | 'details' | 'exchange'
  const [isSizeModalPreviewOpen, setIsSizeModalPreviewOpen] = useState(false);
  const [section5PreviewUnit, setSection5PreviewUnit] = useState('in'); // 'in' | 'cm'

  // Collapsible section state (false = expanded, true = contracted/collapsed)
  const [collapsed, setCollapsed] = useState({
    basic: false,
    description: false,
    features: false,
    details: false,
    sizeChart: false,
    exchange: false,
    images: false,
    visibility: false,
  });

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const collapseAll = () => {
    setCollapsed({
      basic: true,
      description: true,
      features: true,
      details: true,
      sizeChart: true,
      exchange: true,
      images: true,
      visibility: true,
    });
  };

  const expandAll = () => {
    setCollapsed({
      basic: false,
      description: false,
      features: false,
      details: false,
      sizeChart: false,
      exchange: false,
      images: false,
      visibility: false,
    });
  };

  useEffect(() => {
    dispatch(fetchCategoriesForSelect());
    if (isEdit) dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        name: current.name || '',
        brand: current.brand || 'AMAYAAR',
        sku: current.sku || '',
        category: current.category?._id || current.category || '',
        description: current.description || '',
        detailedDescription: current.detailedDescription || '',
        keyFeatures:
          Array.isArray(current.keyFeatures) && current.keyFeatures.length
            ? current.keyFeatures
            : Array.isArray(current.highlights) && current.highlights.length
              ? current.highlights
              : [],
        fabric: current.fabric || '',
        gsm: current.gsm || '',
        fit: current.fit || '',
        countryOfOrigin: current.countryOfOrigin || 'India',
        washCare: current.washCare || '',
        whatsOnPrint: current.whatsOnPrint || '',
        stylingTip: current.stylingTip || '',
        exchangePolicy: current.exchangePolicy || '',
        exchangeDays: current.exchangeDays ?? 7,
        modelInfo: current.modelInfo || '',
        sizeChartType: current.sizeChartType || 'default',
        sizeChartImage: current.sizeChartImage || '',
        sizeChartPdf: current.sizeChartPdf || '',
        customSizeChart: Array.isArray(current.customSizeChart) ? current.customSizeChart : [],
        price: current.price ?? '',
        mrp: current.mrp ?? '',
        stock: current.stock ?? '',
        variants: current.variants?.length
          ? current.variants.map((v) => ({
            size: v.size || 'M',
            stock: v.stock ?? 0,
            price: v.price || current.price || 0,
            sku: v.sku || '',
          }))
          : [],
        images: current.images?.length ? current.images : [],
        isFeatured: !!current.isFeatured,
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/uploads/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        }
      }

      if (uploadedUrls.length) {
        setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const DEFAULT_TOPS_ROWS = [
    { size: 'XS', chest: '38', length: '27', shoulder: '18.5', sleeve: '8.5', waist: '', hip: '', inseam: '' },
    { size: 'S', chest: '40', length: '28', shoulder: '19.5', sleeve: '9.0', waist: '', hip: '', inseam: '' },
    { size: 'M', chest: '42', length: '29', shoulder: '20.5', sleeve: '9.5', waist: '', hip: '', inseam: '' },
    { size: 'L', chest: '44', length: '30', shoulder: '21.5', sleeve: '10.0', waist: '', hip: '', inseam: '' },
    { size: 'XL', chest: '46', length: '31', shoulder: '22.5', sleeve: '10.5', waist: '', hip: '', inseam: '' },
    { size: 'XXL', chest: '48', length: '32', shoulder: '23.5', sleeve: '11.0', waist: '', hip: '', inseam: '' },
    { size: '3XL', chest: '50', length: '33', shoulder: '24.5', sleeve: '11.5', waist: '', hip: '', inseam: '' },
  ];

  const DEFAULT_BOTTOMS_ROWS = [
    { size: '28 (XS)', waist: '28 - 29', hip: '38', length: '39', inseam: '28', chest: '', shoulder: '', sleeve: '' },
    { size: '30 (S)', waist: '30 - 31', hip: '40', length: '40', inseam: '29', chest: '', shoulder: '', sleeve: '' },
    { size: '32 (M)', waist: '32 - 33', hip: '42', length: '41', inseam: '30', chest: '', shoulder: '', sleeve: '' },
    { size: '34 (L)', waist: '34 - 35', hip: '44', length: '42', inseam: '30.5', chest: '', shoulder: '', sleeve: '' },
    { size: '36 (XL)', waist: '36 - 37', hip: '46', length: '42.5', inseam: '31', chest: '', shoulder: '', sleeve: '' },
    { size: '38 (XXL)', waist: '38 - 39', hip: '48', length: '43', inseam: '31.5', chest: '', shoulder: '', sleeve: '' },
  ];

  const handleSelectSizeChartMode = (modeId) => {
    setForm((f) => {
      let customRows = f.customSizeChart || [];
      if (modeId === 'custom' && (!customRows || customRows.length === 0)) {
        customRows = DEFAULT_TOPS_ROWS;
      }
      return { ...f, sizeChartType: modeId, customSizeChart: customRows };
    });
  };

  const handleUpdateCustomSizeRow = (index, field, value) => {
    setForm((f) => {
      const updated = [...(f.customSizeChart || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, customSizeChart: updated };
    });
  };

  const handleAddCustomSizeRow = () => {
    setForm((f) => ({
      ...f,
      customSizeChart: [
        ...(f.customSizeChart || []),
        { size: '', chest: '', length: '', shoulder: '', sleeve: '', waist: '', hip: '', inseam: '' },
      ],
    }));
  };

  const handleRemoveCustomSizeRow = (index) => {
    setForm((f) => ({
      ...f,
      customSizeChart: (f.customSizeChart || []).filter((_, i) => i !== index),
    }));
  };

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

  const selectedCatDoc = categories.find((c) => (c._id || c.id) === form.category);
  const catName = (selectedCatDoc?.name || selectedCatDoc?.slug || '').toLowerCase();
  const prodName = (form.name || '').toLowerCase();
  const isBottomAuto =
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
  const resolvedAutoMode = isBottomAuto ? 'bottoms' : 'tops';
  const effectiveSizeChartMode =
    form.sizeChartType === 'default' ? resolvedAutoMode : form.sizeChartType;

  const previewCustomRows = Array.isArray(form.customSizeChart) ? form.customSizeChart : [];
  const previewHasChest = previewCustomRows.some((r) => r.chest && String(r.chest).trim());
  const previewHasLength = previewCustomRows.some((r) => r.length && String(r.length).trim());
  const previewHasShoulder = previewCustomRows.some((r) => r.shoulder && String(r.shoulder).trim());
  const previewHasSleeve = previewCustomRows.some((r) => r.sleeve && String(r.sleeve).trim());
  const previewHasWaist = previewCustomRows.some((r) => r.waist && String(r.waist).trim());
  const previewHasHip = previewCustomRows.some((r) => r.hip && String(r.hip).trim());
  const previewHasInseam = previewCustomRows.some((r) => r.inseam && String(r.inseam).trim());

  const handleSizeChartUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.url) {
        setForm((f) => ({ ...f, sizeChartImage: res.data.data.url, sizeChartType: 'image' }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload size chart image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSizeChartPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.url) {
        setForm((f) => ({ ...f, sizeChartPdf: res.data.data.url }));
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload sizing chart PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, urlInput.trim()] }));
      setUrlInput('');
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  // Key Features handler
  const handleAddFeature = (text) => {
    const feat = (text || featureInput).trim();
    if (!feat) return;
    if (form.keyFeatures.includes(feat)) {
      setFeatureInput('');
      return;
    }
    setForm((f) => ({ ...f, keyFeatures: [...f.keyFeatures, feat] }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setForm((f) => ({ ...f, keyFeatures: f.keyFeatures.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentImages = [...form.images];
    if (urlInput.trim() && !currentImages.includes(urlInput.trim())) {
      currentImages.push(urlInput.trim());
      setUrlInput('');
      setForm((f) => ({ ...f, images: currentImages }));
    }

    if (!currentImages.length) {
      setUploadError('Please upload at least one product image.');
      return;
    }

    const cleanFeatures = form.keyFeatures.filter((f) => f && f.trim());

    const calculatedDiscount =
      form.mrp && form.price && Number(form.mrp) > Number(form.price)
        ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
        : 0;

    const payload = {
      ...form,
      sku: form.sku?.trim() || undefined,
      category: form.category || null,
      price: Number(form.price),
      mrp: Number(form.mrp),
      discount: calculatedDiscount,
      stock: Number(form.stock),
      variants: form.variants || [],
      exchangeDays: form.exchangeDays ? Number(form.exchangeDays) : 7,
      customSizeChart: Array.isArray(form.customSizeChart)
        ? form.customSizeChart
            .filter((r) => r.size && r.size.trim())
            .map((r) => ({
              size: (r.size || '').trim(),
              chest: (r.chest || '').trim(),
              length: (r.length || '').trim(),
              shoulder: (r.shoulder || '').trim(),
              sleeve: (r.sleeve || '').trim(),
              waist: (r.waist || '').trim(),
              hip: (r.hip || '').trim(),
              inseam: (r.inseam || '').trim(),
            }))
        : [],
      keyFeatures: cleanFeatures,
      highlights: cleanFeatures,
      images: currentImages.filter(Boolean),
    };

    const action = isEdit ? updateProduct({ id, payload }) : createProduct(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/products');
  };

  const discountPercent =
    form.mrp && form.price && Number(form.mrp) > Number(form.price)
      ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
      : 0;

  const mainImage = form.images[0]
    ? getMediaUrl(form.images[0])
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${form.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {form.isActive ? 'Active Status' : 'Draft / Hidden'}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          {isEdit ? 'Edit Product' : 'Add New Product'}
          {/*      <Sparkles className="h-4 w-4 text-amber-50 */}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          {isEdit
            ? 'Update product title, description, key features, specifications, and exchange policy'
            : 'Fill in all details to publish a complete product catalog entry'}
        </p>
      </div>

      {(error || uploadError) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-center justify-between shadow-xs">
          <span>{error || uploadError}</span>
          <button onClick={() => setUploadError('')} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* FORM LEFT COLUMN */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-7">
          {/* Section Toolbar: Expand All / Contract All */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Form Sections ({8 - Object.values(collapsed).filter(Boolean).length}/8 Open)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-bold text-slate-600 hover:text-black transition cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-bold text-slate-600 hover:text-black transition cursor-pointer"
              >
                Contract All
              </button>
            </div>
          </div>

          {/* SECTION 1: BASIC INFO & TITLE */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleCollapse('basic')}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-4 w-4 text-slate-700 shrink-0" />
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Product Title & Info
                  </h2>
                  {collapsed.basic && form.name && (
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                      {form.name} • ₹{form.price || 0} • Stock: {form.stock || 0}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                  {collapsed.basic ? 'Expand' : 'Contract'}
                </span>
                <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.basic ? '' : 'rotate-180'}`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </div>
            </button>

            {!collapsed.basic && (
              <div className="p-5 space-y-4">

            {/* Product Title / Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Oversized Heavyweight Cotton T-Shirt"
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
              />
            </div>

            {/* Brand, Category & SKU ID */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. AMAYAAR"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SKU / Product ID <span className="text-slate-400 font-normal text-[11px]">(Auto-gen if empty)</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. AY-TEE-001"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                >
                  <option value="">None / No Category (Optional)</option>
                  {categories.map((c) => {
                    const parentName =
                      c.parent?.name ||
                      (typeof c.parent === 'string' && categories.find((p) => p._id === c.parent)?.name);
                    return (
                      <option key={c._id} value={c._id}>
                        {parentName ? `${parentName} → ${c.name}` : c.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="499"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  MRP (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="mrp"
                  required
                  min="0"
                  value={form.mrp}
                  onChange={handleChange}
                  placeholder="999"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
                />
                {discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                    {discountPercent}% OFF
                  </span>
                )}
                {form.mrp && form.price && Number(form.price) > Number(form.mrp) && (
                  <span className="text-[10px] font-bold text-amber-600 mt-0.5 block">
                    ⚠️ Selling Price is higher than MRP
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Size Variants & Inventory Manager */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Size Variants & Inventory <span className="text-[11px] font-normal text-slate-400">(XS, S, M, L, XL, XXL, Free Size, etc.)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Add or edit stock for each specific size. Customers will see these as selectable size pills.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shrink-0">
                  Total: {form.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || form.stock || 0} pcs
                </span>
              </div>

              {/* Quick-add buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Add:</span>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map((sz) => {
                  const alreadyHas = form.variants?.some((v) => v.size?.toUpperCase() === sz.toUpperCase());
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={alreadyHas}
                      onClick={() => {
                        const next = [
                          ...(form.variants || []),
                          {
                            size: sz,
                            stock: 10,
                            price: Number(form.price) || 0,
                            sku: form.sku ? `${form.sku}-${sz}` : '',
                          },
                        ];
                        setForm((f) => ({
                          ...f,
                          variants: next,
                          stock: next.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
                        }));
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${alreadyHas
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                        : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 border border-slate-300 shadow-2xs'
                        }`}
                    >
                      + {sz}
                    </button>
                  );
                })}
              </div>

              {/* Active size variants grid */}
              {form.variants?.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 pt-1.5">
                  {form.variants.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/60 pl-2 pr-1.5 py-1.5 shadow-2xs hover:border-slate-300 hover:bg-white transition"
                    >
                      <span className="flex h-6 min-w-7 px-1.5 items-center justify-center rounded-md bg-black text-[11px] font-black tracking-wide text-white shrink-0 select-none">
                        {v.size}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => {
                            const updated = [...form.variants];
                            updated[vIdx] = { ...updated[vIdx], sku: e.target.value.toUpperCase() };
                            setForm((f) => ({ ...f, variants: updated }));
                          }}
                          placeholder="SKU"
                          className="w-20 h-6 rounded border border-slate-200 px-1 text-[10px] font-bold text-slate-800 bg-white focus:border-black focus:outline-none uppercase text-center"
                          title="Variant SKU ID"
                        />
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...form.variants];
                            updated[vIdx] = { ...updated[vIdx], stock: Number(e.target.value) || 0 };
                            setForm((f) => ({
                              ...f,
                              variants: updated,
                              stock: updated.reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
                            }));
                          }}
                          placeholder="0"
                          className="w-12 h-6 rounded border border-slate-200 px-1 text-xs font-bold text-slate-800 bg-white focus:border-black focus:outline-none text-center"
                          title="In-stock quantity"
                        />
                        <span className="text-[11px] text-slate-400 font-semibold select-none">pcs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.variants.filter((_, idx) => idx !== vIdx);
                          setForm((f) => ({
                            ...f,
                            variants: updated,
                            stock: updated.reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
                          }));
                        }}
                        className="h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition"
                        title="Remove size"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  No individual size counts configured. Click a Quick Add button above to add sizes like XS, XXL, or Free Size.
                </p>
              )}
            </div>
          </div>
          )}
        </div>

        {/* SECTION 2: PRODUCT DESCRIPTION */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('description')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">2. Product Description</h2>
                {collapsed.description && form.description && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.description ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.description ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.description && (
            <div className="p-5 space-y-4">
              {/* Main Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Main Description <span className="text-slate-400 font-normal text-[11px]">(Storefront Overview)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a concise product summary, highlight its standout appeal, streetwear cut..."
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description / Story <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <textarea
                  name="detailedDescription"
                  rows={3}
                  value={form.detailedDescription}
                  onChange={handleChange}
                  placeholder="Elaborate on product design philosophy, inspiration, craftsmanship, fit notes..."
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none transition"
                />
              </div>

              {/* What's on Print & Styling Tip */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    What's on Print <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="whatsOnPrint"
                    value={form.whatsOnPrint}
                    onChange={handleChange}
                    placeholder="e.g. High-density puff and screen print"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Styling Tip <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="stylingTip"
                    value={form.stylingTip}
                    onChange={handleChange}
                    placeholder="e.g. Pair with raw black relaxed denim & sneakers"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: KEY FEATURES */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('features')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ListChecks className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Key Features / Bullets
                </h2>
                {collapsed.features && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    {form.keyFeatures.length} feature(s) configured
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.features ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.features ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.features && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Add bullet points displayed directly below the description on the product page (e.g. Fit, Fabric, Finish, Collar).
              </p>

              {/* Feature Input Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. 100% Breathable Heavyweight Cotton (Press Enter or click Add)"
                  className="flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Quick Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FEATURE_SUGGESTIONS.map((sug, i) => {
                    const isAdded = form.keyFeatures.includes(sug);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddFeature(sug)}
                        className={`text-[11px] rounded-md px-2.5 py-1 border transition flex items-center gap-1 ${isAdded
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-black hover:bg-slate-50'
                          }`}
                      >
                        <Plus className="h-3 w-3" /> {sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Features List */}
              {form.keyFeatures.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block">Current Key Features:</span>
                  <div className="space-y-1.5">
                    {form.keyFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                          <span className="font-medium">{feat}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Remove feature"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center text-xs text-slate-400 font-medium">
                  No key features added yet. Type above or click a suggestion to add.
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: PRODUCT DETAILS & SPECIFICATIONS */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('details')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  4. Product Details & Fabric Specs
                </h2>
                {collapsed.details && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    {form.fabric || 'Fabric Specs'} • {form.fit || 'Fit Specs'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.details ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.details ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.details && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                These specifications populate the "Details" tab on the product details storefront page.
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    name="fabric"
                    value={form.fabric}
                    onChange={handleChange}
                    placeholder="e.g. 100% Super Combed Terry Cotton"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Weight / GSM</label>
                  <input
                    type="text"
                    name="gsm"
                    value={form.gsm}
                    onChange={handleChange}
                    placeholder="e.g. 380 GSM Heavyweight Fabric"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fit & Silhouette</label>
                  <input
                    type="text"
                    name="fit"
                    value={form.fit}
                    onChange={handleChange}
                    placeholder="e.g. Oversized Streetwear Fit, Dropped Shoulder"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Wearing Info / Height</label>
                  <input
                    type="text"
                    name="modelInfo"
                    value={form.modelInfo}
                    onChange={handleChange}
                    placeholder="e.g. Model is 1.90 m and wears size M"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country of Origin</label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={form.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="e.g. India"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wash & Care Instructions</label>
                <textarea
                  name="washCare"
                  rows={2}
                  value={form.washCare}
                  onChange={handleChange}
                  placeholder="e.g. Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low."
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: SIZE CHART & FIT GUIDE */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('sizeChart')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Ruler className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">5. Size Chart & Fit Guide</h2>
                {collapsed.sizeChart && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    Mode: {form.sizeChartType} {form.modelInfo ? `• ${form.modelInfo}` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.sizeChart ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.sizeChart ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.sizeChart && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Controls the customer "Sizing chart" popup and fit reference displayed on the storefront.
              </p>

              {/* Template / Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Size Chart Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'default', label: 'Auto (Category Preset)', desc: 'Tops / Bottoms based on category' },
                    { id: 'tops', label: 'Tops / Streetwear Tees', desc: 'Chest, Length, Shoulder, Sleeve' },
                    { id: 'bottoms', label: 'Bottoms / Cargos / Pants', desc: 'Waist, Hip, Inseam, Outseam' },
                    { id: 'custom', label: 'Custom Measurement Table', desc: 'Custom size rows & table values' },
                    { id: 'image', label: 'Upload Graphic Image', desc: 'Custom size chart diagram/photo' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectSizeChartMode(t.id)}
                      className={`rounded-lg border p-2.5 text-left transition ${
                        form.sizeChartType === t.id
                          ? 'border-black bg-slate-50 ring-1 ring-black'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{t.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Custom Measurement Table Mode */}
              {form.sizeChartType === 'custom' && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        Custom Sizing Table Measurements (Inches)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Enter exact measurements for each size. Customers will see these values in the storefront Sizing Chart modal.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, customSizeChart: DEFAULT_TOPS_ROWS }))}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        title="Load Tops (Tees/Hoodies/Jackets) standard values"
                      >
                        Reset to Tops Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, customSizeChart: DEFAULT_BOTTOMS_ROWS }))}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        title="Load Bottoms (Pants/Cargos) standard values"
                      >
                        Reset to Bottoms Preset
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomSizeRow}
                        className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Size</span>
                      </button>
                    </div>
                  </div>

                  {/* Measurement Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                          <th className="py-2 px-3 w-28">Size Label</th>
                          <th className="py-2 px-3">Chest / Bust (in)</th>
                          <th className="py-2 px-3">Front Length (in)</th>
                          <th className="py-2 px-3">Shoulder (in)</th>
                          <th className="py-2 px-3">Sleeve (in)</th>
                          <th className="py-2 px-3">Waist (in)</th>
                          <th className="py-2 px-3">Hip / Inseam</th>
                          <th className="py-2 px-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(form.customSizeChart || []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.size || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'size', e.target.value)}
                                placeholder="e.g. M"
                                className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-900 focus:bg-white focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.chest || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'chest', e.target.value)}
                                placeholder='42"'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.length || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'length', e.target.value)}
                                placeholder='29"'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.shoulder || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'shoulder', e.target.value)}
                                placeholder='20.5"'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.sleeve || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'sleeve', e.target.value)}
                                placeholder='9.5"'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.waist || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'waist', e.target.value)}
                                placeholder='—'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.hip || row.inseam || ''}
                                onChange={(e) => handleUpdateCustomSizeRow(idx, 'hip', e.target.value)}
                                placeholder='—'
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-black focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomSizeRow(idx)}
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="Delete row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* If Graphic Image Upload Mode */}
              {form.sizeChartType === 'image' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">Custom Size Chart Graphic / Diagram</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 rounded-md bg-black px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Chart Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSizeChartUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400 font-medium">or paste image URL:</span>
                    <input
                      type="text"
                      value={form.sizeChartImage}
                      onChange={(e) => setForm((f) => ({ ...f, sizeChartImage: e.target.value }))}
                      placeholder="https://.../size-chart.png"
                      className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-black focus:outline-none"
                    />
                  </div>
                  {form.sizeChartImage && (
                    <div className="relative inline-block border rounded-lg p-1 bg-slate-50 mt-2">
                      <img
                        src={getMediaUrl(form.sizeChartImage)}
                        alt="Size Chart Preview"
                        className="max-h-48 rounded object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, sizeChartImage: '' }))}
                        className="absolute top-2 right-2 rounded-full bg-rose-600 text-white p-1 shadow hover:bg-rose-700"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Size Chart PDF Section (Default or Custom Product-Specific PDF) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Sizing Chart PDF Document</label>
                    <p className="text-[11px] text-slate-500">
                      Storefront Sizing Chart modal directly displays this PDF. Leave blank to use the official default (<code>/sizing-chart.pdf</code>).
                    </p>
                  </div>
                  {form.sizeChartPdf && (
                    <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                      Custom PDF Configured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-md bg-black px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Custom PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleSizeChartPdfUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400 font-medium">or paste PDF URL:</span>
                  <input
                    type="text"
                    value={form.sizeChartPdf || ''}
                    onChange={(e) => setForm((f) => ({ ...f, sizeChartPdf: e.target.value }))}
                    placeholder="/sizing-chart.pdf or https://.../guide.pdf"
                    className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-black focus:outline-none"
                  />
                  {form.sizeChartPdf && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, sizeChartPdf: '' }))}
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700">Active PDF:</span>
                  <code className="text-slate-800 font-mono text-[11px]">
                    {form.sizeChartPdf ? getMediaUrl(form.sizeChartPdf) : '/sizing-chart.pdf (Official Amayaar Guide)'}
                  </code>
                  <a
                    href={form.sizeChartPdf ? getMediaUrl(form.sizeChartPdf) : '/sizing-chart.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-bold text-black underline flex items-center gap-1 hover:text-slate-700"
                  >
                    View PDF ↗
                  </a>
                </div>
              </div>

              {/* LIVE CUSTOMER STOREFRONT PREVIEW (WHAT USERS WILL SEE ON ALL MODES) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                      <Eye className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-tight text-slate-900">
                          Live Customer Preview
                        </h4>
                        <span className="rounded bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          {form.sizeChartType === 'default'
                            ? `Auto Preset (${resolvedAutoMode === 'bottoms' ? 'Bottoms' : 'Tops'})`
                            : form.sizeChartType === 'tops'
                            ? 'Tops Preset'
                            : form.sizeChartType === 'bottoms'
                            ? 'Bottoms Preset'
                            : form.sizeChartType === 'custom'
                            ? 'Custom Table'
                            : 'Graphic Image'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Realtime preview of what customers see when clicking "Sizing chart" on this product.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Unit Toggle */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSection5PreviewUnit('in')}
                        className={`rounded px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                          section5PreviewUnit === 'in' ? 'bg-black text-white shadow-2xs' : 'text-slate-500 hover:text-black'
                        }`}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSection5PreviewUnit('cm')}
                        className={`rounded px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                          section5PreviewUnit === 'cm' ? 'bg-black text-white shadow-2xs' : 'text-slate-500 hover:text-black'
                        }`}
                      >
                        CM (cm)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSizeModalPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                    >
                      <Ruler className="h-3.5 w-3.5" />
                      <span>Preview Customer Modal</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Display based on mode */}
                {effectiveSizeChartMode === 'image' ? (
                  form.sizeChartImage ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
                      <img
                        src={getMediaUrl(form.sizeChartImage)}
                        alt="Product Size Chart"
                        className="max-h-64 object-contain rounded"
                      />
                      <span className="text-[11px] text-slate-500 mt-2 font-medium">
                        Customers will see this visual diagram inside the modal.
                      </span>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-white rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
                      Upload a graphic image above to preview it here.
                    </div>
                  )
                ) : effectiveSizeChartMode === 'custom' ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                          <th className="py-2.5 px-3">Size</th>
                          {previewHasChest && <th className="py-2.5 px-3">Chest / Bust</th>}
                          {previewHasLength && <th className="py-2.5 px-3">Front Length</th>}
                          {previewHasShoulder && <th className="py-2.5 px-3">Shoulder</th>}
                          {previewHasSleeve && <th className="py-2.5 px-3">Sleeve</th>}
                          {previewHasWaist && <th className="py-2.5 px-3">Waist</th>}
                          {previewHasHip && <th className="py-2.5 px-3">Hip</th>}
                          {previewHasInseam && <th className="py-2.5 px-3">Inseam</th>}
                          <th className="py-2.5 px-3 text-right">Customer Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewCustomRows.length > 0 ? (
                          previewCustomRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="py-2 px-3 font-black text-slate-900">{row.size || '—'}</td>
                              {previewHasChest && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.chest, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasLength && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.length, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasShoulder && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.shoulder, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasSleeve && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.sleeve, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasWaist && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.waist, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasHip && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.hip, section5PreviewUnit)}
                                </td>
                              )}
                              {previewHasInseam && (
                                <td className="py-2 px-3 font-medium text-slate-700">
                                  {formatMeasurement(row.inseam, section5PreviewUnit)}
                                </td>
                              )}
                              <td className="py-2 px-3 text-right">
                                <span className="rounded bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase">
                                  Select
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="p-4 text-center text-xs text-slate-400">
                              No sizes added yet. Use the table editor above to configure sizes.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : effectiveSizeChartMode === 'bottoms' ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                          <th className="py-2.5 px-3">Size / Waist</th>
                          <th className="py-2.5 px-3">Waist Span</th>
                          <th className="py-2.5 px-3">Hip</th>
                          <th className="py-2.5 px-3">Outseam Length</th>
                          <th className="py-2.5 px-3">Inseam</th>
                          <th className="py-2.5 px-3 text-right">Customer Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {DEFAULT_BOTTOMS_ROWS.map((row) => (
                          <tr key={row.size} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 font-black text-slate-900">{row.size}</td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.waist, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.hip, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.length, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.inseam, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="rounded bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase">
                                Select
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider">
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Chest / Bust</th>
                          <th className="py-2.5 px-3">Front Length</th>
                          <th className="py-2.5 px-3">Shoulder</th>
                          <th className="py-2.5 px-3">Sleeve</th>
                          <th className="py-2.5 px-3 text-right">Customer Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {DEFAULT_TOPS_ROWS.map((row) => (
                          <tr key={row.size} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 font-black text-slate-900">{row.size}</td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.chest, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.length, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.shoulder, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {formatMeasurement(row.sleeve, section5PreviewUnit)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="rounded bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase">
                                Select
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Model Fit Reference Footnote */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Fit Reference:{' '}
                    <strong className="text-slate-800">
                      {form.modelInfo || "Model is 5'8\" (172 cm), 70 kg, Wearing M Size."}
                    </strong>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Auto-synced with Section 5 fit settings
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: EXCHANGE POLICY */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('exchange')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <RotateCcw className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">6. Exchange Policy</h2>
                {collapsed.exchange && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    {form.exchangeDays || 7} Days Return/Exchange Policy
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.exchange ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.exchange ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.exchange && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Set product-specific return or doorstep exchange rules. Leave empty to use global store settings.
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exchange Window (Days)</label>
                  <input
                    type="number"
                    name="exchangeDays"
                    min="0"
                    max="90"
                    value={form.exchangeDays}
                    onChange={handleChange}
                    placeholder="7"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-black focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">e.g. 7 days doorstep pickup</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Specific Exchange Policy Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="exchangePolicy"
                    rows={2}
                    value={form.exchangePolicy}
                    onChange={handleChange}
                    placeholder="e.g. Hassle-free 7-day doorstep exchange & return. Items must be in original condition with tags attached."
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: PRODUCT IMAGES */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('images')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ImageIcon className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">7. Product Images</h2>
                {collapsed.images && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    {form.images.length} image(s) selected
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.images ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.images ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.images && (
            <div className="p-5 space-y-4">
              {/* Option A: Direct File Upload */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-black" /> Option A: Select File(s) from Computer
                </span>
                <label className="relative flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3.5 text-center cursor-pointer hover:bg-slate-100/70 hover:border-slate-400 transition">
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  {uploading ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      <span className="text-xs font-bold text-black">Uploading image(s)...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-black">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">
                          Choose Product Image(s) <span className="text-black font-semibold underline">or drag & drop</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">Select multiple images at once (PNG, JPG, WEBP)</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Divider OR */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-2.5 text-[10px] font-bold text-slate-400">OR</span>
              </div>

              {/* Option B: Image URL Input */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-black" /> Option B: Add Image URL
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="rounded-md bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Uploaded Images Thumbnails Grid */}
              {form.images.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Selected Product Images ({form.images.length}):</span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {form.images.map((imgUrl, idx) => {
                      const fullSrc = getMediaUrl(imgUrl);
                      return (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-md overflow-hidden border border-slate-300 bg-slate-100 shadow-xs"
                        >
                          <img src={fullSrc} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold text-white uppercase">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 rounded bg-rose-600 p-1 text-white opacity-90 hover:bg-rose-700 transition"
                            title="Remove Image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 8: VISIBILITY & PUBLISHING */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleCollapse('visibility')}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition cursor-pointer text-left border-b border-slate-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Eye className="h-4 w-4 text-slate-700 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">8. Visibility & Publishing</h2>
                {collapsed.visibility && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm mt-0.5">
                    Status: {form.isActive ? 'Active (Live)' : 'Draft (Hidden)'} {form.isFeatured ? '• Featured' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 hover:text-black hidden sm:inline">
                {collapsed.visibility ? 'Expand' : 'Contract'}
              </span>
              <span className={`p-1 rounded-md text-slate-500 hover:bg-slate-200/60 transition-transform duration-200 ${collapsed.visibility ? '' : 'rotate-180'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          {!collapsed.visibility && (
            <div className="p-5 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition flex-1">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Featured Product</span>
                  <span className="block text-[10px] text-slate-500">Show on homepage featured collection</span>
                </div>
              </label>

              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition flex-1">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Active Status</span>
                  <span className="block text-[10px] text-slate-500">Visible for customers to buy</span>
                </div>
              </label>
            </div>
          )}
        </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>

        {/* RIGHT PREVIEW COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3 sticky top-6">
            {/* Preview Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md flex-wrap">
                <button
                  type="button"
                  onClick={() => setPreviewTab('card')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition ${previewTab === 'card' ? 'bg-white text-black shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                >
                  Card Preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('details')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition ${previewTab === 'details' ? 'bg-white text-black shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                >
                  Storefront Tabs
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('sizeChart')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition flex items-center gap-1 ${previewTab === 'sizeChart' ? 'bg-white text-black shadow-xs' : 'text-slate-600 hover:text-black'
                    }`}
                >
                  <Ruler className="h-3 w-3" />
                  <span>Size Chart</span>
                </button>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-black shrink-0">
                <Check className="h-3 w-3" /> Realtime
              </span>
            </div>

            {/* PREVIEW VIEW 1: PRODUCT CARD */}
            {previewTab === 'card' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
                <div className="relative aspect-[4/3] bg-slate-900">
                  {mainImage ? (
                    <img src={mainImage} alt="Preview" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon className="h-8 w-8 mb-1 opacity-40" />
                      <span className="text-xs font-medium">Product image preview</span>
                    </div>
                  )}
                  {form.isFeatured && (
                    <span className="absolute top-2 left-2 bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white rounded">
                      Featured
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 right-2 bg-rose-600 px-2 py-0.5 text-[9px] font-extrabold text-white rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-1.5 bg-white">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    {form.brand || 'BRAND'}
                  </p>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {form.name || 'Product Title'}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{form.price ? Number(form.price).toLocaleString('en-IN') : '0'}
                    </span>
                    {form.mrp && Number(form.mrp) > Number(form.price) && (
                      <span className="text-xs text-slate-400 line-through font-medium">
                        ₹{Number(form.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-100 mt-2">
                    <span>
                      Stock: <strong className="text-slate-800">{form.stock || 0} units</strong>
                    </span>
                    <span className={form.isActive ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {form.isActive ? 'In Stock' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW VIEW 2: STOREFRONT TABS PREVIEW */}
            {previewTab === 'details' && (
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-3">
                {/* Sizing Chart Bar matching Storefront */}
                <div className="flex items-center justify-between text-[11px] text-neutral-600 pb-2 border-b border-neutral-100">
                  <span className="font-medium text-neutral-600 truncate max-w-[170px]">
                    {form.modelInfo || "Model is 5'8\" (172 cm), 70 kg, Wearing M Size"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeModalPreviewOpen(true)}
                    className="text-neutral-900 font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                  >
                    <Ruler className="h-3 w-3 text-neutral-900" />
                    <span>Sizing chart</span>
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 text-xs font-medium text-neutral-500 pb-1">
                  <button
                    type="button"
                    onClick={() => setStorefrontActiveTab('description')}
                    className={`pb-1 px-1.5 transition text-[11px] font-bold relative ${storefrontActiveTab === 'description' ? 'text-black' : 'text-neutral-400 hover:text-black'
                      }`}
                  >
                    Description
                    {storefrontActiveTab === 'description' && (
                      <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-black" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorefrontActiveTab('details')}
                    className={`pb-1 px-1.5 transition text-[11px] font-bold relative ${storefrontActiveTab === 'details' ? 'text-black' : 'text-neutral-400 hover:text-black'
                      }`}
                  >
                    Details
                    {storefrontActiveTab === 'details' && (
                      <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-black" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorefrontActiveTab('exchange')}
                    className={`pb-1 px-1.5 transition text-[11px] font-bold relative ${storefrontActiveTab === 'exchange' ? 'text-black' : 'text-neutral-400 hover:text-black'
                      }`}
                  >
                    Exchange Policy
                    {storefrontActiveTab === 'exchange' && (
                      <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-black" />
                    )}
                  </button>
                </div>

                {/* Tab 1 Content: Description + Key Features */}
                {storefrontActiveTab === 'description' && (
                  <div className="space-y-3 text-[11px] text-neutral-700 leading-relaxed">
                    <p className="text-neutral-600">
                      {form.description || 'Product description will appear here as entered in the form.'}
                    </p>

                    {form.keyFeatures.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100">
                        <p className="font-bold text-neutral-900 mb-1">Key Features:</p>
                        <ul className="space-y-1 text-neutral-600">
                          {form.keyFeatures.map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-black font-bold">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {form.detailedDescription && (
                      <div className="pt-2 border-t border-neutral-100">
                        <p className="font-bold text-neutral-900 mb-0.5">Detailed Description:</p>
                        <p className="text-neutral-600 whitespace-pre-line">{form.detailedDescription}</p>
                      </div>
                    )}

                    {form.whatsOnPrint && (
                      <div>
                        <p className="font-bold text-neutral-900 mb-0.5">Whats on Print:</p>
                        <p className="text-neutral-600">{form.whatsOnPrint}</p>
                      </div>
                    )}

                    {form.stylingTip && (
                      <div>
                        <p className="font-bold text-neutral-900 mb-0.5">Styling Tip:</p>
                        <p className="text-neutral-600">{form.stylingTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2 Content: Details */}
                {storefrontActiveTab === 'details' && (
                  <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fabric</span>
                      <span className="font-medium text-neutral-900">
                        {form.fabric || '100% Super Combed Terry Cotton (Default)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fabric Weight</span>
                      <span className="font-medium text-neutral-900">
                        {form.gsm || '380 GSM Heavyweight Fabric (Default)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fit</span>
                      <span className="font-medium text-neutral-900">
                        {form.fit || 'Oversized Streetwear Fit, Dropped Shoulder (Default)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Country of Origin</span>
                      <span className="font-medium text-neutral-900">
                        {form.countryOfOrigin || 'India'}
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="font-semibold text-neutral-500 block mb-0.5">Care Instructions</span>
                      <p className="text-neutral-600 text-[10px] leading-normal">
                        {form.washCare ||
                          'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3 Content: Exchange Policy */}
                {storefrontActiveTab === 'exchange' && (
                  <div className="space-y-2 text-[11px] text-neutral-700 leading-relaxed">
                    <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="font-bold text-neutral-900 flex items-center gap-1 text-[11px]">
                        <RotateCcw className="h-3.5 w-3.5 text-neutral-800" />
                        <span>{form.exchangeDays || 7} Days Doorstep Exchange & Return</span>
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        FREE EXCHANGE
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Exchange Policy:</p>
                      <p className="text-[10px] text-neutral-600">
                        {form.exchangePolicy ||
                          'Hassle-free doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW VIEW 3: STOREFRONT SIZE CHART PREVIEW */}
            {previewTab === 'sizeChart' && (
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-black" />
                    <span className="text-xs font-black uppercase text-slate-900">
                      Storefront Size Chart
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSizeModalPreviewOpen(true)}
                    className="text-[10px] font-bold text-black underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Modal</span>
                    <Eye className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Mode:{' '}
                    {form.sizeChartType === 'default'
                      ? `Auto (${resolvedAutoMode})`
                      : form.sizeChartType}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
                    <button
                      type="button"
                      onClick={() => setSection5PreviewUnit('in')}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                        section5PreviewUnit === 'in' ? 'bg-black text-white' : 'text-slate-600'
                      }`}
                    >
                      in
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection5PreviewUnit('cm')}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                        section5PreviewUnit === 'cm' ? 'bg-black text-white' : 'text-slate-600'
                      }`}
                    >
                      cm
                    </button>
                  </div>
                </div>

                {effectiveSizeChartMode === 'image' && form.sizeChartImage ? (
                  <div className="flex justify-center p-2 bg-slate-50 rounded border border-slate-100">
                    <img
                      src={getMediaUrl(form.sizeChartImage)}
                      alt="Chart"
                      className="max-h-40 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded border border-slate-200 text-[10px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold">
                          <th className="p-1.5">Size</th>
                          <th className="p-1.5">
                            {effectiveSizeChartMode === 'bottoms' ? 'Waist' : 'Chest'}
                          </th>
                          <th className="p-1.5">Length</th>
                          <th className="p-1.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(effectiveSizeChartMode === 'custom'
                          ? previewCustomRows
                          : effectiveSizeChartMode === 'bottoms'
                          ? DEFAULT_BOTTOMS_ROWS
                          : DEFAULT_TOPS_ROWS
                        ).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-900">{row.size}</td>
                            <td className="p-1.5 text-slate-700">
                              {formatMeasurement(
                                row.chest || row.waist,
                                section5PreviewUnit
                              )}
                            </td>
                            <td className="p-1.5 text-slate-700">
                              {formatMeasurement(row.length, section5PreviewUnit)}
                            </td>
                            <td className="p-1.5 text-right">
                              <span className="rounded bg-black text-white px-1.5 py-0.5 text-[8px] font-bold uppercase">
                                Select
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="rounded bg-slate-50 p-2 border border-slate-100 text-[10px] text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-800">
                    Fit:{' '}
                    <span className="font-normal">
                      {form.modelInfo || "Model is 5'8\", 70 kg, Wearing M"}
                    </span>
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Free 7-day size exchange enabled for customer reassurance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL SCREEN CUSTOMER SIZING CHART PREVIEW MODAL */}
      <SizeChartPreviewModal
        isOpen={isSizeModalPreviewOpen}
        onClose={() => setIsSizeModalPreviewOpen(false)}
        product={form}
        categories={categories}
      />
    </div>
  );
}
