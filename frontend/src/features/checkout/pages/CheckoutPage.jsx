import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  Plus,
  ShieldCheck,
  Truck,
  ArrowRight,
  Package,
  QrCode,
  Building,
  Check,
  X,
  Phone,
  AlertCircle,
} from 'lucide-react';
import api from '../../../lib/axios';
import { fetchAddresses, addAddress } from '../../account/accountSlice';
import { fetchCart } from '../../cart/cartSlice';
import { createOrder } from '../../orders/ordersSlice';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { addresses = [] } = useSelector((state) => state.account || {});
  const { items = [], summary = {} } = useSelector((state) => state.cart || {});
  const { currentOrder, orderPlacing } = useSelector((state) => state.orders || {});
  const { user } = useSelector((state) => state.auth || {});

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'COD'
  const [newAddressModal, setNewAddressModal] = useState(false);

  // New Address Form
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: true,
  });

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    const created = await dispatch(addAddress(addressForm));
    if (created.payload?._id) {
      setSelectedAddressId(created.payload._id);
    }
    setNewAddressModal(false);
  };

  const [orderError, setOrderError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    if (!selectedAddressId) {
      setOrderError('Please select a valid shipping address');
      setStep(1);
      return;
    }

    let provider = 'cod';
    let method = 'Cash on Delivery';

    if (paymentMethod === 'UPI') {
      provider = 'razorpay';
      method = 'UPI Payment';
    } else if (paymentMethod === 'CARD') {
      provider = 'razorpay';
      method = 'Credit / Debit Card';
    } else if (paymentMethod === 'NETBANKING') {
      provider = 'razorpay';
      method = 'Net Banking';
    }

    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);

    const orderRes = await dispatch(
      createOrder({
        shippingAddressId: selectedAddressId,
        shippingAddress: selectedAddr,
        paymentProvider: provider,
        paymentMethod: method,
      })
    );

    if (!createOrder.fulfilled.match(orderRes)) {
      setOrderError(orderRes.payload || 'Failed to place order. Please try again.');
      return;
    }

    const createdOrder = orderRes.payload;

    if (paymentMethod === 'COD') {
      setStep(3); // Direct COD success
      return;
    }

    // Online Razorpay Payment Flow
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setOrderError('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      const { data: rzpRes } = await api.post('/payments/create-order', {
        amount: createdOrder.total,
        receipt: `order_${createdOrder._id}`,
      });

      const rzpData = rzpRes.data || rzpRes;

      const options = {
        key: rzpData.keyId || 'rzp_test_S7lSvWtu89c6zD',
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'AMA YAAR',
        description: `Order #${createdOrder.orderNumber}`,
        order_id: rzpData.id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: createdOrder._id,
              method,
            });
            setStep(3);
          } catch (verErr) {
            setOrderError(verErr.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: selectedAddr?.fullName || user?.name || '',
          email: user?.email || '',
          contact: selectedAddr?.phone || user?.phone || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setOrderError('Payment checkout modal was closed.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      setStep(3);
    }
  };

  /* Step 3: Confirmation Success View */
  if (step === 3 && currentOrder) {
    return (
      <div className="min-h-screen bg-neutral-50/50 py-12">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="rounded-xl border border-neutral-200/60 bg-white p-8 sm:p-10 shadow-sm space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-10 w-10 stroke-[2]" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">
                ORDER CONFIRMED
              </span>
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                Thank You for Your Order!
              </h1>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Your order <strong className="text-black">#{currentOrder.orderNumber}</strong> has been received and will be processed immediately.
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-4 text-left text-xs space-y-2 border border-neutral-200/80">
              <div className="flex justify-between font-bold">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Delivering To:</span>
                <span className="text-black font-extrabold">{currentOrder.shippingAddress?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Address:</span>
                <span className="text-right max-w-xs font-semibold text-neutral-700">
                  {currentOrder.shippingAddress?.line1}, {currentOrder.shippingAddress?.city} - {currentOrder.shippingAddress?.pincode}
                </span>
              </div>
              <div className="flex justify-between font-black pt-2 border-t border-neutral-200 text-black">
                <span className="uppercase tracking-wider text-[10px] text-neutral-500">Payable Total:</span>
                <span className="text-sm font-black text-black">₹{currentOrder.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={`/orders/${currentOrder._id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
              >
                Track Live Order Status &rarr;
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto rounded-lg border border-neutral-200 bg-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-neutral-100 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator Header */}
        <div className="mb-10 flex items-center justify-center gap-4 text-xs font-black">
          <div className={`flex items-center gap-2.5 ${step >= 1 ? 'text-black' : 'text-neutral-400'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${step >= 1 ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
              1
            </div>
            <span className="uppercase tracking-wider">Delivery Address</span>
          </div>

          <div className="h-0.5 w-12 bg-neutral-200"></div>

          <div className={`flex items-center gap-2.5 ${step >= 2 ? 'text-black' : 'text-neutral-400'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${step >= 2 ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
              2
            </div>
            <span className="uppercase tracking-wider">Payment & Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Checkout Steps Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Address Selection */}
            <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-5">
                <h2 className="text-base font-black text-black uppercase tracking-tight flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-black" /> 1. Select Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={() => setNewAddressModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3.5 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-neutral-200 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-10 text-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50">
                  <p className="text-xs text-neutral-500 font-medium mb-5">
                    No saved addresses found. Please add a shipping address to proceed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setNewAddressModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Add Address Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative cursor-pointer rounded-xl p-5 border-2 transition ${
                        selectedAddressId === addr._id
                          ? 'border-black bg-neutral-50/80 shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-black uppercase tracking-wide">{addr.fullName}</span>
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase text-neutral-600">
                            {addr.addressType || 'Home'}
                          </span>
                        </div>
                        {selectedAddressId === addr._id && (
                          <span className="flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shrink-0">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-neutral-700 font-extrabold mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-black shrink-0" /> {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {step === 1 && addresses.length > 0 && (
                <div className="mt-7 flex justify-end pt-4 border-t border-neutral-100">
                  <button
                    disabled={!selectedAddressId}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2.5 rounded-lg bg-black px-7 py-3.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-md disabled:opacity-50"
                  >
                    Proceed to Payment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method Selection */}
            {step === 2 && (
              <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-5">
                  <h2 className="text-base font-black text-black uppercase tracking-tight flex items-center gap-2.5">
                    <CreditCard className="h-5 w-5 text-black" /> 2. Choose Payment Method
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-black text-black uppercase tracking-wider hover:underline"
                  >
                    Edit Address
                  </button>
                </div>

                <div className="space-y-3">
                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'UPI'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black uppercase tracking-wide">UPI / QR (Instant & Recommended)</p>
                        <p className="text-[11px] text-neutral-500 font-medium">Google Pay, PhonePe, Paytm & BHIM</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'UPI' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Cards Option */}
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'CARD'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black uppercase tracking-wide">Credit / Debit Card</p>
                        <p className="text-[11px] text-neutral-500 font-medium">Visa, MasterCard, RuPay & Diners</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'CARD' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black uppercase tracking-wide">Net Banking</p>
                        <p className="text-[11px] text-neutral-500 font-medium">All Major Indian Banks</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'NETBANKING' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'NETBANKING' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'COD'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black uppercase tracking-wide">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-neutral-500 font-medium">Pay cash or scan QR upon doorstep delivery</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'COD' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-end pt-4 border-t border-neutral-100">
                  {orderError && (
                    <div className="mb-4 w-full rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      {orderError}
                    </div>
                  )}

                  <button
                    disabled={orderPlacing}
                    onClick={handlePlaceOrder}
                    className="flex items-center gap-2.5 rounded-lg bg-black px-8 py-4 text-xs font-black text-white uppercase tracking-wider shadow-md hover:bg-neutral-800 transition duration-200 disabled:opacity-50"
                  >
                    {orderPlacing ? 'Securing Order...' : `Pay ₹${summary.total?.toLocaleString('en-IN')} & Place Order`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Preview */}
          <div className="lg:col-span-4 rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm sticky top-24">
            <h3 className="text-xs font-black text-black uppercase tracking-wider mb-4 pb-3 border-b border-neutral-100">
              Order Summary ({items.length} items)
            </h3>

            <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 pr-1 mb-4">
              {items.map((i) => (
                <div key={i._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={i.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg object-cover bg-neutral-100 border border-neutral-200/60"
                    />
                    <div className="truncate">
                      <p className="font-extrabold text-black uppercase tracking-wide truncate text-[11px]">{i.product?.name}</p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Qty: {i.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-black shrink-0 text-xs">₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs text-neutral-600 font-semibold pt-3 border-t border-neutral-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-black font-bold">₹{summary.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-extrabold">
                  <span>Coupon Savings</span>
                  <span>-₹{summary.couponDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{summary.deliveryCharge === 0 ? <strong className="text-emerald-600 font-black uppercase">FREE</strong> : `₹${summary.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>₹{summary.tax?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200 text-black">
                <span className="text-xs font-black uppercase tracking-wider">Payable Total</span>
                <span className="text-lg font-black text-black">₹{summary.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {newAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
              <h3 className="text-sm font-black text-black uppercase tracking-wider">Add Shipping Address</h3>
              <button
                onClick={() => setNewAddressModal(false)}
                className="text-neutral-400 hover:text-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">Mobile Phone</label>
                  <input
                    required
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">Flat, House No., Street</label>
                <input
                  required
                  type="text"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">City</label>
                  <input
                    required
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">State</label>
                  <input
                    required
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">Pincode</label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs font-semibold text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1.5">Address Type</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, addressType: t })}
                      className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                        addressForm.addressType === t ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setNewAddressModal(false)}
                  className="rounded-lg border border-neutral-200 px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black px-6 py-2.5 text-xs font-black text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
