import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchCouponById, createCoupon, updateCoupon, clearCurrentCoupon } from '../couponsSlice';
import FormField, { Input, Select } from '../../../components/FormField';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderValue: '',
  maxDiscount: '',
  startDate: '',
  expiryDate: '',
  usageLimit: '',
  isActive: true,
};

const toDateInput = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function CouponFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current, saving, error } = useSelector((state) => state.coupons);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isEdit) dispatch(fetchCouponById(id));
    return () => dispatch(clearCurrentCoupon());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        code: current.code || '',
        discountType: current.discountType || 'percentage',
        discountValue: current.discountValue ?? '',
        minOrderValue: current.minOrderValue ?? '',
        maxDiscount: current.maxDiscount ?? '',
        startDate: toDateInput(current.startDate),
        expiryDate: toDateInput(current.expiryDate),
        usageLimit: current.usageLimit ?? '',
        isActive: current.isActive !== false,
      });
    }
  }, [isEdit, current]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue) || 0,
      minOrderValue: Number(form.minOrderValue) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: Number(form.usageLimit) || 0,
    };
    const action = isEdit ? updateCoupon({ id, payload }) : createCoupon(payload);
    const result = await dispatch(action);
    if (!result.error) navigate('/coupons');
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <button
        onClick={() => navigate('/coupons')}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Coupons
      </button>

      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{isEdit ? 'Edit Coupon' : 'Add Coupon'}</h1>
      </div>

      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <FormField label="Coupon Code" required hint="Customers will enter this at checkout">
          <Input
            name="code"
            required
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. WELCOME50"
            className="font-mono uppercase"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Discount Type" required>
            <Select name="discountType" value={form.discountType} onChange={handleChange}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="freeDelivery">Free Delivery</option>
            </Select>
          </FormField>

          {form.discountType !== 'freeDelivery' && (
            <FormField label={form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'} required>
              <Input type="number" name="discountValue" required min="0" value={form.discountValue} onChange={handleChange} />
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Min. Order Value (₹)">
            <Input type="number" name="minOrderValue" min="0" value={form.minOrderValue} onChange={handleChange} />
          </FormField>
          <FormField label="Max Discount (₹)" hint="Only for percentage discounts">
            <Input type="number" name="maxDiscount" min="0" value={form.maxDiscount} onChange={handleChange} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" required>
            <Input type="date" name="startDate" required value={form.startDate} onChange={handleChange} />
          </FormField>
          <FormField label="Expiry Date" required>
            <Input type="date" name="expiryDate" required value={form.expiryDate} onChange={handleChange} />
          </FormField>
        </div>

        <FormField label="Usage Limit" hint="0 = unlimited uses">
          <Input type="number" name="usageLimit" min="0" value={form.usageLimit} onChange={handleChange} />
        </FormField>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Active
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
