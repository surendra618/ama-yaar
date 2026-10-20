import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  MapPin,
  MessageSquare,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  fetchProductDetails,
  fetchProductReviews,
  submitProductReview,
  clearProductDetails,
} from "../productDetailsSlice";
import { addToCart, openDrawer, closeDrawer } from "../../cart/cartSlice";
import { toggleWishlist } from "../../wishlist/wishlistSlice";
import ProductCard from "../../../components/ProductCard";
import Loader from "../../../components/Loader";
import AuthPopupModal from "../../../components/AuthPopupModal";
import api from "../../../lib/axios";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [policySettings, setPolicySettings] = useState(null);

  useEffect(() => {
    api
      .get("/settings/delivery")
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data) setPolicySettings(data);
      })
      .catch(() => {});
  }, []);

  const { product, related, reviews, reviewStats, loading, error } = useSelector(
    (state) => state.productDetails,
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { itemCount } = useSelector((state) => state.cart);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);
  const [pincode, setPincode] = useState(() => localStorage.getItem("ay_delivery_pincode") || "");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeError, setPincodeError] = useState("");

  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setPincodeError("Please enter a valid 6-digit Indian PIN code");
      return;
    }
    setPincodeLoading(true);
    setPincodeError("");
    try {
      const res = await api.get(`/shiprocket/serviceability?pincode=${pincode.trim()}`);
      const data = res.data?.data || res.data;
      setPincodeResult(data);
      localStorage.setItem("ay_delivery_pincode", pincode.trim());
    } catch (err) {
      setPincodeError(err.response?.data?.message || "Serviceability check failed. Please try again.");
    } finally {
      setPincodeLoading(false);
    }
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("ay_delivery_pincode");
    if (savedPin && savedPin.length === 6 && !pincodeResult) {
      handleCheckPincode();
    }
  }, []);

  const [activeTab, setActiveTab] = useState("description");

  // Magnifying Zoom state for main product image
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Review & Size Guide form modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    dispatch(clearProductDetails());
    dispatch(fetchProductDetails(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchProductReviews(product._id));
      if (product.variants?.length > 0) {
        if (product.variants[0].size) setSelectedSize(product.variants[0].size);
        if (product.variants[0].color)
          setSelectedColor(product.variants[0].color);
      }
    }
  }, [dispatch, product?._id]);

  if (loading) {
    return <Loader size="lg" label="Loading fit details..." minHeight="min-h-[70vh]" />;
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-neutral-50/50 py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
            <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Fit Not Found</h2>
          <p className="text-xs text-neutral-500 font-medium mt-1.5 mb-6 leading-relaxed">
            {error || "The product you're looking for doesn't exist, is temporarily unavailable, or has been discontinued."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition shadow-sm w-full cursor-pointer"
          >
            Explore All Fits &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some(
    (item) =>
      (item._id || item) === product._id ||
      (item.slug && item.slug === product.slug),
  );

  const PLACEHOLDER_GALLERY = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
  ];

  const rawImages = (product.images || [])
    .filter(Boolean)
    .map((img) =>
      img.startsWith("http") || img.startsWith("data:")
        ? img
        : img.startsWith("/uploads")
          ? `http://localhost:5000${img}`
          : img,
    );
  const displayImages =
    rawImages.length === 0
      ? PLACEHOLDER_GALLERY
      : Array.from({ length: 4 }, (_, i) => rawImages[i % rawImages.length]);

  const availableSizes =
    product.variants?.length > 0 && product.variants.some((v) => v.size)
      ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)))
      : ["S", "M", "L", "XL"];

  const handleAddToCart = async () => {
    const sizeToUse = selectedSize || availableSizes[0] || "M";
    setIsAddingToCart(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          product,
          quantity,
          variant: { size: sizeToUse, color: selectedColor },
        }),
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
      dispatch(openDrawer());
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const sizeToUse = selectedSize || availableSizes[0] || "M";
    setIsBuyingNow(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          product,
          quantity,
          variant: { size: sizeToUse, color: selectedColor },
        }),
      );
      dispatch(closeDrawer());
      if (!isAuthenticated) {
        setAuthSuccessCallback(() => () => navigate('/checkout'));
        setAuthModalOpen(true);
      } else {
        navigate('/checkout');
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthSuccessCallback(() => () => setReviewModalOpen(true));
      setAuthModalOpen(true);
      return;
    }
    setSubmittingReview(true);
    await dispatch(
      submitProductReview({
        productId: product._id,
        rating: newRating,
        comment: newComment,
      }),
    );
    setSubmittingReview(false);
    setReviewModalOpen(false);
    setNewComment("");
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="min-h-screen bg-white py-1 sm:py-2 text-neutral-900 font-sans">
      <div className="mx-auto w-full max-w-[1720px] px-2 sm:px-4 lg:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-3 flex items-center gap-2 text-[11px] font-medium text-neutral-400">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-semibold truncate max-w-[260px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Product Overview 3-Column Grid (Image Centered & Large, Minimal Padding) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center py-1">
          {/* LEFT COLUMN: Title, Description, Bullet Features, Model Info */}
          <div className="lg:col-span-3 flex flex-col justify-center order-2 lg:order-1 pr-0 lg:pr-2">
            <h1 className="text-xl sm:text-2xl lg:text-[27px] font-bold tracking-tight text-neutral-900 leading-[1.2]">
              {product.name || "Men's Oversized Puffer Winter Bubble Jacket"}
            </h1>

            <p className="mt-3 text-xs sm:text-[13px] text-neutral-600 leading-[1.45] font-normal">
              {product.description ||
                "Ultra-warm insulated winter puffer jacket with high stand collar, detachable hood, thermal fleece lining, and water-repellent shell."}
            </p>

            {/* Bullet points with small clean dots */}
            <ul className="mt-4 space-y-1.5 text-xs sm:text-[12px] text-neutral-700 font-normal leading-normal">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-neutral-800 shrink-0" />
                <span>Fit: oversized, dropped shoulder</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-neutral-800 shrink-0" />
                <span>Fabric: heavyweight cotton</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-neutral-800 shrink-0" />
                <span>Finish: washed effect with high-density print</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-neutral-800 shrink-0" />
                <span>Collar: reinforced rib</span>
              </li>
            </ul>

            {/* Model wear info */}
            <p className="mt-3.5 text-[11.5px] text-neutral-400 font-normal">
              {product.modelInfo || "Model is 1.90 m and wears size M"}
            </p>
          </div>

          {/* CENTER COLUMN: Large Focused Product Image (Centered, High Visibility, No Padding Restriction) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
            <div
              className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-[620px] overflow-hidden rounded-md bg-neutral-100 flex items-center justify-center shadow-xs group cursor-crosshair"
              onMouseEnter={() => setIsHoveringZoom(true)}
              onMouseLeave={() => setIsHoveringZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={displayImages[selectedImage] || displayImages[0]}
                alt={product.name || "Product Showcase"}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHoveringZoom ? "scale(2.5)" : "scale(1)",
                }}
                className={`h-full w-full object-cover object-top select-none pointer-events-none will-change-transform ${
                  isHoveringZoom
                    ? "transition-[transform-origin] duration-75 ease-out"
                    : "transition-transform duration-200 ease-out"
                }`}
              />

              {/* Left Arrow Button (hidden while zooming for unobstructed view) */}
              {!isHoveringZoom && displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/95 hover:bg-black/70 transition cursor-pointer backdrop-blur-xs shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Right Arrow Button (hidden while zooming for unobstructed view) */}
              {!isHoveringZoom && displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/95 hover:bg-black/70 transition cursor-pointer backdrop-blur-xs shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Discount pill matching user screenshot */}
              {!isHoveringZoom && product.discount > 0 && (
                <span className="absolute top-3 left-3 rounded-xs bg-black px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                  {product.discount}% OFF
                </span>
              )}

              {/* Zoom pill indicator */}
              {isHoveringZoom ? (
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
                  2.5x Zoom
                </span>
              ) : (
                <span className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-xs text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  <Search className="h-2.5 w-2.5" /> Hover to zoom
                </span>
              )}
            </div>

            {/* Small Subtle Thumbnail Preview Row */}
            {displayImages.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`h-14 w-11 sm:h-16 sm:w-13 overflow-hidden rounded-sm border transition cursor-pointer ${
                      selectedImage === idx
                        ? "border-neutral-800 opacity-100"
                        : "border-neutral-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Size Selectors, ADD TO CART Button, Details Tabs */}
          <div className="lg:col-span-3 flex flex-col justify-center order-3 pl-0 lg:pl-2 space-y-4">
            {/* Size Selector */}
            <div>
              <span className="block text-xs font-medium text-neutral-500 mb-2">
                Size
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {(availableSizes.length > 0 ? availableSizes : ["M", "L", "XL"]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-9 w-10 sm:h-10 sm:w-11 text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? "border-neutral-800 bg-white text-neutral-950 font-bold"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART & BUY NOW Buttons (Stacked Vertically, Full Width, Sleek Height) */}
            <div className="pt-1 space-y-2">
              <div className="flex flex-col gap-2 w-full">
                {/* ADD TO CART Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isAddingToCart}
                  className="w-full h-10 sm:h-10.5 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 hover:border-neutral-400 text-xs font-bold uppercase tracking-wider px-4 rounded-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isAddingToCart ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                      <span>Adding to Bag...</span>
                    </>
                  ) : added ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 text-neutral-800" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>

                {/* BUY NOW Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0 || isBuyingNow}
                  className="w-full h-10 sm:h-10.5 bg-[#141414] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-4 rounded-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 border border-neutral-900 hover:border-black disabled:opacity-50 active:scale-[0.99] group"
                >
                  {isBuyingNow ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>BUY NOW — ₹{product.price?.toLocaleString("en-IN") || "3,299"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Cart banner when item added */}
              {added && (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Item added to your bag!
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(openDrawer())}
                    className="text-xs font-black uppercase tracking-wider text-black underline hover:text-neutral-700 cursor-pointer"
                  >
                    View Cart &rarr;
                  </button>
                </div>
              )}

              {/* Wishlist toggle & extra details */}
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthSuccessCallback(() => () => dispatch(toggleWishlist(product._id)));
                      setAuthModalOpen(true);
                      return;
                    }
                    dispatch(toggleWishlist(product._id));
                  }}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    isWishlisted ? "text-rose-600 font-bold" : "hover:text-black"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
                  />
                  <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                </button>
                <span className="text-[11px] text-neutral-400">
                  Free shipping & returns
                </span>
              </div>
            </div>

            {/* AVAILABLE OFFERS Strip matching user screenshot */}
            <div className="pt-3.5 border-t border-neutral-200 space-y-2">
              <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Available Offers
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide text-xs">
                {[
                  { discount: "₹150 OFF", condition: "Prepaid above ₹1849", code: "LEVEL1FLEX" },
                  { discount: "₹300 OFF", condition: "Prepaid above ₹2699", code: "LEVEL2FLEX" },
                  { discount: "₹550 OFF", condition: "Prepaid above ₹3599", code: "LEVEL3FLEX" },
                  { discount: "₹850 OFF", condition: "Prepaid above ₹4999", code: "LEVEL4FLEX" },
                ].map((offer, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 min-w-[155px] p-2.5 rounded-lg border border-neutral-200 bg-white shadow-2xs text-left"
                  >
                    <p className="font-extrabold text-neutral-900 text-xs">{offer.discount}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{offer.condition}</p>
                    <div className="mt-2 flex items-center justify-between text-[9px]">
                      <span className="font-mono font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded-xs">
                        {offer.code}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <Zap className="h-2.5 w-2.5 fill-emerald-600" /> Auto Applied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Shiprocket Serviceability Checker */}
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-neutral-700" /> Delivery Options
                </span>
                {pincodeResult?.isServiceable && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <Check className="h-3 w-3 text-emerald-600" /> Serviceable
                  </span>
                )}
              </div>

              <form onSubmit={handleCheckPincode} className="relative flex items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    setPincodeError('');
                  }}
                  placeholder="Enter 6-digit delivery PIN code"
                  className="w-full h-9 rounded-sm border border-neutral-200 pl-3 pr-20 text-xs font-medium text-black placeholder:text-neutral-400 focus:border-black focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-xs transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  {pincodeLoading ? 'Checking…' : 'Check'}
                </button>
              </form>

              {pincodeError && (
                <p className="text-[11px] text-rose-600 font-medium">{pincodeError}</p>
              )}

              {pincodeResult && (
                <div className="rounded-lg bg-neutral-50/80 border border-neutral-200 p-3 space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-semibold text-neutral-900">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <span>Expected by <strong>{pincodeResult.estimatedDeliveryDate || '3-4 Days'}</strong></span>
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {pincodeResult.estimatedDays} Days Delivery
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/60 text-[11px] text-neutral-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{pincodeResult.codAvailable ? 'Cash on Delivery Available' : 'Prepaid Orders Only'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{policySettings?.freeDeliveryThreshold ? `Free shipping above ₹${policySettings.freeDeliveryThreshold}` : 'Free Standard Shipping'}</span>
                    </div>
                  </div>

                  {pincodeResult.fastestCourier && (
                    <p className="text-[10px] text-neutral-400 font-medium">
                      Fulfilled via Shiprocket Express ({pincodeResult.fastestCourier.name || 'Express Courier'})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sizing Chart Bar matching user screenshot */}
            <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
              <span className="text-[11px] font-medium text-neutral-600">
                Model is 5'8" (172 cm), 70 kg, Wearing M Size
              </span>
              <button
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="text-neutral-800 font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>目 Sizing chart</span>
              </button>
            </div>

            {/* 3 TABS: Description | Details | Exchange Policy (Exact match to User Screenshot) */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex border-b border-neutral-200 justify-between text-xs font-medium text-neutral-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`pb-2 px-2.5 transition cursor-pointer relative ${
                    activeTab === "description" ? "text-black font-bold" : "hover:text-black"
                  }`}
                >
                  Description
                  {activeTab === "description" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 px-2.5 transition cursor-pointer relative ${
                    activeTab === "details" ? "text-black font-bold" : "hover:text-black"
                  }`}
                >
                  Details
                  {activeTab === "details" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("exchange")}
                  className={`pb-2 px-2.5 transition cursor-pointer relative ${
                    activeTab === "exchange" ? "text-black font-bold" : "hover:text-black"
                  }`}
                >
                  Exchange Policy
                  {activeTab === "exchange" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="pt-3 text-xs text-neutral-700 leading-relaxed">
                {activeTab === "description" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="leading-relaxed text-neutral-600">
                      {product.description ||
                        "Ultra-warm insulated winter puffer jacket with high stand collar, detachable hood, thermal fleece lining, and water-repellent shell."}
                    </p>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Whats on Print:</p>
                      <p className="text-neutral-600 whitespace-pre-line">
                        {product.whatsOnPrint ||
                          policySettings?.defaultWhatsOnPrint ||
                          "High-density puff and screen print with reinforced stitching."}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Styling Tip:</p>
                      <p className="text-neutral-600">
                        {product.stylingTip ||
                          policySettings?.defaultStylingTip ||
                          "Pair with heavy knit beanie and raw black relaxed denim for peak streetwear silhouette."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fabric</span>
                      <span className="font-medium text-neutral-900">
                        {product.fabric || policySettings?.defaultFabric || "100% Super Combed Terry Cotton"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fabric Weight</span>
                      <span className="font-medium text-neutral-900">
                        {product.gsm || policySettings?.defaultGsm || "380 GSM Heavyweight Fabric"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Fit</span>
                      <span className="font-medium text-neutral-900">
                        {product.fit || policySettings?.defaultFit || "Oversized Streetwear Fit, Dropped Shoulder"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-500">Country of Origin</span>
                      <span className="font-medium text-neutral-900">
                        {product.countryOfOrigin || policySettings?.defaultCountryOfOrigin || "India"}
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="font-semibold text-neutral-500 block mb-0.5">Care Instructions</span>
                      <p className="text-neutral-600 text-[11px] leading-normal">
                        {product.washCare ||
                          policySettings?.defaultCare ||
                          "Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "exchange" && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="font-bold text-neutral-900 flex items-center gap-1 text-[11px]">
                        <RotateCcw className="h-3.5 w-3.5 text-neutral-800" />
                        <span>{policySettings?.exchangeDays || 7} Days Doorstep Exchange & Return</span>
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {policySettings?.exchangeCharge > 0
                          ? `₹${policySettings.exchangeCharge} Pickup Fee`
                          : "FREE EXCHANGE"}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Delivery & Shipping Charges:</p>
                      <p className="text-[11px] text-neutral-600">
                        Standard delivery fee is ₹{policySettings?.deliveryCharge ?? 49}.00{" "}
                        {policySettings?.isFreeDeliveryEnabled && (
                          <span className="font-semibold text-emerald-600">
                            (FREE on orders above ₹{policySettings?.freeDeliveryThreshold ?? 500}.00)
                          </span>
                        )}
                        . Estimated arrival in {policySettings?.estimatedDeliveryDays || "2-4 business days"}.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Exchange Policy:</p>
                      <p className="text-[11px] text-neutral-600">
                        {policySettings?.exchangePolicyText ||
                          "Hassle-free 7-day doorstep exchange & return. Items must be in original condition, unworn, unwashed with original brand tags attached."}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-neutral-900 mb-0.5">Refunds:</p>
                      <p className="text-[11px] text-neutral-600">
                        {policySettings?.returnPolicyText ||
                          "Easy returns within 7 days of delivery. Refunds are credited to original payment mode or store credit within 24-48 hours after quality check."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like — Related Products Listing Directly Below Details */}
        {(() => {
          const FEATURED_RECOMMENDATIONS = [
            {
              _id: "rec_1",
              name: "Oversized Stylish Graphic T-shirt",
              brand: "AMA YAAR",
              price: 450,
              mrp: 899,
              discount: 50,
              rating: 4.8,
              numReviews: 124,
              images: [
                "/model01.png",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
              ],
              category: { name: "Men Fashion", slug: "men-fashion" },
              stock: 25,
            },
            {
              _id: "rec_2",
              name: "Sleeveless Acid Wash Casual Vest",
              brand: "URBAN FITS",
              price: 599,
              mrp: 1199,
              discount: 50,
              rating: 4.7,
              numReviews: 86,
              images: [
                "/model04.png",
                "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80",
              ],
              category: { name: "Streetwear", slug: "streetwear" },
              stock: 18,
            },
            {
              _id: "rec_3",
              name: "Classic Zipper Polo T-Shirt",
              brand: "RAYMOND",
              price: 899,
              mrp: 1799,
              discount: 50,
              rating: 4.9,
              numReviews: 210,
              images: [
                "/model03.png",
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
              ],
              category: { name: "Polos", slug: "polos" },
              stock: 30,
            },
            {
              _id: "rec_4",
              name: "Vintage Wash Denim Casual Shirt",
              brand: "LEVIS",
              price: 1299,
              mrp: 2499,
              discount: 48,
              rating: 4.6,
              numReviews: 95,
              images: [
                "/model02.png",
                "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
              ],
              category: { name: "Shirts", slug: "shirts" },
              stock: 12,
            },
            {
              _id: "rec_5",
              name: "Vintage Graphic Urban Tee",
              brand: "AMA YAAR",
              price: 499,
              mrp: 999,
              discount: 50,
              rating: 4.8,
              numReviews: 112,
              images: [
                "/model05.jpg",
                "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
              ],
              category: { name: "Graphic Tees", slug: "graphic-tees" },
              stock: 20,
            },
            {
              _id: "rec_6",
              name: "Acid Wash Denim Street Jacket",
              brand: "DENIM CO",
              price: 1499,
              mrp: 2999,
              discount: 50,
              rating: 4.9,
              numReviews: 145,
              images: [
                "/boyse.png",
                "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
              ],
              category: { name: "Jackets", slug: "jackets" },
              stock: 15,
            },
            {
              _id: "rec_7",
              name: "Urban Zipper Polo Shirt",
              brand: "ZARA FITS",
              price: 799,
              mrp: 1599,
              discount: 50,
              rating: 4.7,
              numReviews: 78,
              images: [
                "/side.png",
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
              ],
              category: { name: "Polos", slug: "polos" },
              stock: 22,
            },
            {
              _id: "rec_8",
              name: "Streetwear Casual Oversized Tee",
              brand: "AMA YAAR",
              price: 549,
              mrp: 1099,
              discount: 50,
              rating: 4.8,
              numReviews: 160,
              images: [
                "/model07.jpg",
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
              ],
              category: { name: "Streetwear", slug: "streetwear" },
              stock: 28,
            },
            {
              _id: "rec_9",
              name: "Tactical Cargo Oversized Sweatshirt",
              brand: "AMA YAAR",
              price: 999,
              mrp: 1999,
              discount: 50,
              rating: 4.9,
              numReviews: 215,
              images: [
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
                "/model01.png",
              ],
              category: { name: "Sweatshirts", slug: "sweatshirts" },
              stock: 19,
            },
            {
              _id: "rec_10",
              name: "Minimalist Heavyweight Cotton Hoodie",
              brand: "URBAN FITS",
              price: 1299,
              mrp: 2599,
              discount: 50,
              rating: 4.8,
              numReviews: 184,
              images: [
                "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80",
                "/model03.png",
              ],
              category: { name: "Hoodies", slug: "hoodies" },
              stock: 24,
            },
            {
              _id: "rec_11",
              name: "Relaxed Fit Street Chino Trousers",
              brand: "ZARA FITS",
              price: 1199,
              mrp: 2399,
              discount: 50,
              rating: 4.7,
              numReviews: 92,
              images: [
                "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=80",
                "/boyse.png",
              ],
              category: { name: "Trousers", slug: "trousers" },
              stock: 16,
            },
            {
              _id: "rec_12",
              name: "Premium Embroidered Street Cap",
              brand: "AMA YAAR",
              price: 399,
              mrp: 799,
              discount: 50,
              rating: 4.9,
              numReviews: 310,
              images: [
                "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
                "/side.png",
              ],
              category: { name: "Accessories", slug: "accessories" },
              stock: 35,
            },
          ];

          const displayRelated =
            related && related.length >= 12
              ? related
              : [...(related || []), ...FEATURED_RECOMMENDATIONS].slice(0, 12);

          return (
            <div className="mt-14 pt-8 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                    Recommended For You
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">
                    YOU MIGHT ALSO LIKE
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-black uppercase tracking-wider hover:opacity-75 transition"
                >
                  Explore All Products <Share2 className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* 4 Cards Grid - 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {displayRelated.map((rel) => (
                  <ProductCard key={rel._id} product={rel} />
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Review this Product
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Rating:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-6 w-6 ${s <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Feedback:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this item..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Login Popup Modal */}
      <AuthPopupModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthSuccessCallback(null);
        }}
        onSuccess={(user) => {
          setAuthModalOpen(false);
          if (authSuccessCallback) {
            authSuccessCallback(user);
            setAuthSuccessCallback(null);
          } else {
            navigate('/checkout');
          }
        }}
      />
    </div>
  );
}
