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
  CheckCircle2,
  Loader2,
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
  Ruler,
  Camera,
  Video,
  Play,
  Trash2,
  Film,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import {
  fetchProductDetails,
  fetchProductReviews,
  submitProductReview,
  clearProductDetails,
} from "../productDetailsSlice";
import { addToCart, openDrawer, closeDrawer, getAvailableStock } from "../../cart/cartSlice";
import { toggleWishlist } from "../../wishlist/wishlistSlice";
import ProductCard from "../../../components/ProductCard";
import Loader from "../../../components/Loader";
import AuthPopupModal from "../../../components/AuthPopupModal";
import SizeChartModal from "../components/SizeChartModal";
import api from "../../../lib/axios";
import { getMediaUrl } from "../../../utils/mediaUrl";

const PLACEHOLDER_GALLERY = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
];

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
    // If the mouse is directly over navigation buttons or indicator dots, do not zoom
    if (e.target && e.target.closest && e.target.closest('button')) {
      if (isHoveringZoom) setIsHoveringZoom(false);
      return;
    }

    if (!isHoveringZoom) {
      setIsHoveringZoom(true);
    }

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
  const [hoverRating, setHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideos, setReviewVideos] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadMediaError, setUploadMediaError] = useState("");
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const openReviewModal = () => {
    if (user?.name) {
      setNewReviewerName(user.name);
    }
    if (user?.email) {
      setNewReviewerEmail(user.email);
    }
    setReviewSuccessMsg("");
    setReviewImages([]);
    setReviewVideos([]);
    setUploadMediaError("");
    setReviewModalOpen(true);
  };

  const handleUploadReviewMedia = async (e, mediaType) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingMedia(true);
    setUploadMediaError("");

    try {
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 50MB file size limit.`);
        }

        const isVid = file.type.startsWith("video/") || mediaType === "video";
        if (isVid && reviewVideos.length >= 2) {
          alert("Maximum 2 video clips per review allowed.");
          continue;
        }
        if (!isVid && reviewImages.length >= 5) {
          alert("Maximum 5 photos per review allowed.");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/uploads/single", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const uploadedUrl = res.data?.data?.url;
        if (uploadedUrl) {
          if (isVid) {
            setReviewVideos((prev) => [...prev, uploadedUrl]);
          } else {
            setReviewImages((prev) => [...prev, uploadedUrl]);
          }
        }
      }
    } catch (err) {
      setUploadMediaError(err.response?.data?.message || err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploadingMedia(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index) => {
    setReviewVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const rawImages = (product?.images || [])
    .filter(Boolean)
    .map((img) => getMediaUrl(img));
  const displayImages = rawImages.length > 0 ? rawImages : PLACEHOLDER_GALLERY;
  const safeImageIndex = selectedImage < displayImages.length ? selectedImage : 0;

  const handlePrevImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (displayImages.length <= 1) return;
    setIsHoveringZoom(false);
    setZoomPos({ x: 50, y: 50 });
    setSelectedImage((prev) =>
      prev <= 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (displayImages.length <= 1) return;
    setIsHoveringZoom(false);
    setZoomPos({ x: 50, y: 50 });
    setSelectedImage((prev) =>
      prev >= displayImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || displayImages.length <= 1) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) handleNextImage();
        else handlePrevImage();
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (displayImages.length <= 1) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayImages.length]);

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

  const availableSizes =
    product.variants?.length > 0 && product.variants.some((v) => v.size)
      ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)))
      : ["S", "M", "L", "XL"];

  const currentSizeToUse = selectedSize || availableSizes[0] || "M";
  const selectedSizeStock = getAvailableStock(product, { size: currentSizeToUse, color: selectedColor });
  const isOutOfStock = selectedSizeStock <= 0;

  const handleAddToCart = async () => {
    const sizeToUse = currentSizeToUse;
    if (selectedSizeStock <= 0) return;
    setIsAddingToCart(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          product,
          quantity: Math.min(quantity, selectedSizeStock),
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
    const sizeToUse = currentSizeToUse;
    if (selectedSizeStock <= 0) return;
    setIsBuyingNow(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          product,
          quantity: Math.min(quantity, selectedSizeStock),
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
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await dispatch(
        submitProductReview({
          productId: product._id,
          rating: newRating,
          title: newTitle.trim(),
          comment: newComment.trim(),
          userName: newReviewerName.trim() || user?.name || "Verified Buyer",
          userEmail: newReviewerEmail.trim() || user?.email || "",
          images: reviewImages,
          videos: reviewVideos,
        })
      ).unwrap();

      setReviewSuccessMsg("Thank you! Your review has been posted successfully.");
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMsg("");
        setNewComment("");
        setNewTitle("");
        setReviewImages([]);
        setReviewVideos([]);
      }, 1400);
    } catch (err) {
      alert(typeof err === "string" ? err : err?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start py-0">
          {/* LEFT COLUMN: Title, Description, Bullet Features, Model Info */}
          <div className="lg:col-span-3 flex flex-col justify-start order-2 lg:order-1 pr-0 lg:pr-2 pt-0 sm:pt-1">
            <h1 className="text-xl sm:text-2xl lg:text-[27px] font-bold tracking-tight text-neutral-900 leading-[1.2]">
              {product.name || "Men's Oversized Puffer Winter Bubble Jacket"}
            </h1>
            {product.sku && (
              <p className="mt-1 font-mono text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                SKU: {product.sku}
              </p>
            )}

            {/* Price & MRP Row */}
            <div className="mt-2.5 flex items-baseline gap-2.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                ₹{Number(product.price || 0).toLocaleString("en-IN")}
              </span>
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <span className="text-sm text-neutral-400 line-through font-normal">
                  ₹{Number(product.mrp).toLocaleString("en-IN")}
                </span>
              )}
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  {product.discount || Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Rating Stars & Customer Review Count */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-neutral-100 text-neutral-900 px-2 py-0.5 rounded text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating || (reviewStats?.average ? reviewStats.average.toFixed(1) : "4.5")}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("customer-reviews-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs text-neutral-500 hover:text-black font-medium underline underline-offset-2 cursor-pointer"
              >
                {reviews?.length || product.numReviews || 0} reviews
              </button>
              <span className="text-neutral-300">•</span>
              <button
                type="button"
                onClick={openReviewModal}
                className="text-xs font-bold text-black hover:opacity-75 cursor-pointer underline underline-offset-2"
              >
                Write a review
              </button>
            </div>

            <p className="mt-3 text-xs sm:text-[13px] text-neutral-600 leading-[1.55] font-normal whitespace-pre-line">
              {product.description ||
                "Ultra-warm insulated winter puffer jacket with high stand collar, detachable hood, thermal fleece lining, and water-repellent shell."}
            </p>
          </div>

          {/* CENTER COLUMN: Large Focused Product Image (Centered, High Visibility, No Padding Restriction) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-start order-1 lg:order-2 pt-0">
            <div
              className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-w-[620px] overflow-hidden rounded-md bg-neutral-100 flex items-center justify-center shadow-xs group cursor-crosshair select-none"
              onMouseEnter={() => setIsHoveringZoom(true)}
              onMouseLeave={() => setIsHoveringZoom(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={safeImageIndex}
                src={displayImages[safeImageIndex] || displayImages[0]}
                alt={product.name || "Product Showcase"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=85";
                }}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHoveringZoom ? "scale(1.5)" : "scale(1)",
                  transition: isHoveringZoom
                    ? "transform 200ms ease-out, transform-origin 75ms ease-out"
                    : "transform 200ms ease-out",
                }}
                className="h-full w-full object-cover object-top select-none pointer-events-none will-change-transform"
              />

              {/* Left Arrow Button (Always clickable when multiple images exist) */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setIsHoveringZoom(false);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setIsHoveringZoom(true);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white/95 hover:bg-black hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer backdrop-blur-md shadow-md focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Right Arrow Button (Always clickable when multiple images exist) */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setIsHoveringZoom(false);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setIsHoveringZoom(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white/95 hover:bg-black hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer backdrop-blur-md shadow-md focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Slide Dots Indicator */}
              {displayImages.length > 1 && !isHoveringZoom && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-auto">
                  {displayImages.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(dotIdx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        safeImageIndex === dotIdx
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Discount pill matching user screenshot */}
              {!isHoveringZoom && product.discount > 0 && (
                <span className="absolute top-3 left-3 z-10 rounded-xs bg-black px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                  {product.discount}% OFF
                </span>
              )}

              {/* Zoom pill indicator */}
              {isHoveringZoom ? (
                <span className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
                  1.5x Zoom
                </span>
              ) : (
                <span className="absolute bottom-3 left-3 z-10 bg-black/40 backdrop-blur-xs text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
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
                      safeImageIndex === idx
                        ? "border-neutral-900 ring-1 ring-neutral-900 opacity-100"
                        : "border-neutral-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80";
                      }}
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Size Selectors, ADD TO CART Button, Details Tabs */}
          <div className="lg:col-span-3 flex flex-col justify-start order-3 pl-0 lg:pl-2 space-y-4 pt-0 sm:pt-1">
            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-medium text-neutral-500">
                  Size
                </span>
                {selectedSizeStock <= 5 && (
                  <span className={`text-[11px] font-bold ${isOutOfStock ? 'text-rose-600' : 'text-amber-600'}`}>
                    {isOutOfStock ? 'Out of Stock' : `Only ${selectedSizeStock} left!`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(availableSizes.length > 0 ? availableSizes : ["M", "L", "XL"]).map((sz) => {
                  const szStock = getAvailableStock(product, { size: sz, color: selectedColor });
                  const szDisabled = szStock <= 0;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={szDisabled}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-9 w-10 sm:h-10 sm:w-11 text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer relative ${
                        selectedSize === sz
                          ? "border-neutral-800 bg-white text-neutral-950 font-bold shadow-xs"
                          : szDisabled
                          ? "border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADD TO CART & BUY NOW Buttons (Stacked Vertically, Full Width, Sleek Height) */}
            <div className="pt-1 space-y-2">
              <div className="flex flex-col gap-2 w-full">
                {/* ADD TO CART Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="w-full h-10 sm:h-10.5 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 hover:border-neutral-400 text-xs font-bold uppercase tracking-wider px-4 rounded-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                      <span>Adding to Bag...</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>OUT OF STOCK</span>
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
                  disabled={isOutOfStock || isBuyingNow}
                  className="w-full h-10 sm:h-10.5 bg-[#141414] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-4 rounded-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 border border-neutral-900 hover:border-black disabled:opacity-50 active:scale-[0.99] group disabled:cursor-not-allowed"
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
                {product.modelInfo || "Model is 5'8\" (172 cm), 70 kg, Wearing M Size"}
              </span>
              <button
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="text-neutral-900 font-bold text-xs flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Ruler className="h-3.5 w-3.5 text-neutral-900" />
                <span>Sizing chart</span>
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

                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 px-2.5 transition cursor-pointer relative ${
                    activeTab === "reviews" ? "text-black font-bold" : "hover:text-black"
                  }`}
                >
                  Reviews ({reviews?.length || product.numReviews || 0})
                  {activeTab === "reviews" && (
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

                    {/* Key Features / Highlights */}
                    {((product.keyFeatures && product.keyFeatures.length > 0) || (product.highlights && product.highlights.length > 0)) && (
                      <div className="pt-2 border-t border-neutral-100">
                        <p className="font-bold text-neutral-900 mb-1.5">Key Features:</p>
                        <ul className="space-y-1 text-neutral-600">
                          {(product.keyFeatures?.length ? product.keyFeatures : product.highlights).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs">
                              <span className="text-neutral-900 font-bold">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.detailedDescription && (
                      <div className="pt-2 border-t border-neutral-100">
                        <p className="font-bold text-neutral-900 mb-0.5">Detailed Description:</p>
                        <p className="text-neutral-600 whitespace-pre-line">{product.detailedDescription}</p>
                      </div>
                    )}

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
                    {product.sku && (
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-500">SKU / Item Code</span>
                        <span className="font-mono text-[11px] font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      </div>
                    )}
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
                    {product.specifications?.map((spec, sIdx) => (
                      <div key={sIdx} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-500">{spec.name}</span>
                        <span className="font-medium text-neutral-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "exchange" && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <span className="font-bold text-neutral-900 flex items-center gap-1 text-[11px]">
                        <RotateCcw className="h-3.5 w-3.5 text-neutral-800" />
                        <span>{product.exchangeDays || policySettings?.exchangeDays || 7} Days Doorstep Exchange & Return</span>
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
                        {product.exchangePolicy ||
                          policySettings?.exchangePolicyText ||
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

                {activeTab === "reviews" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-black text-sm text-neutral-900">
                          {product.rating || (reviewStats?.average ? reviewStats.average.toFixed(1) : "4.5")} / 5.0
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          ({reviews?.length || product.numReviews || 0} reviews)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openReviewModal}
                        className="rounded-sm bg-black px-2.5 py-1 text-[11px] font-bold text-white hover:bg-neutral-800 transition cursor-pointer"
                      >
                        + Write Review
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((r, i) => (
                          <div key={r._id || i} className="p-2.5 rounded bg-neutral-50 border border-neutral-100 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-neutral-900">{r.authorName || r.userName || "Customer"}</span>
                              <div className="flex text-amber-400">
                                {[...Array(r.rating || 5)].map((_, si) => (
                                  <Star key={si} className="h-3 w-3 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                            {r.title && <p className="font-semibold text-neutral-800 text-[11px]">{r.title}</p>}
                            <p className="text-neutral-600 text-[11px] line-clamp-2">{r.comment}</p>

                            {/* Media preview in quick tab */}
                            {((r.images && r.images.length > 0) || (r.videos && r.videos.length > 0)) && (
                              <div className="flex items-center gap-1.5 pt-1.5">
                                {r.videos?.map((v, vi) => (
                                  <button
                                    key={`tab-v-${vi}`}
                                    type="button"
                                    onClick={() =>
                                      setActiveMediaModal({
                                        url: getMediaUrl(v),
                                        type: "video",
                                        author: r.authorName || r.userName,
                                      })
                                    }
                                    className="relative h-9 w-9 rounded-md overflow-hidden border border-neutral-300 bg-black cursor-pointer shrink-0"
                                  >
                                    <video src={getMediaUrl(v)} className="h-full w-full object-cover opacity-70" />
                                    <Play className="absolute inset-0 m-auto h-3 w-3 text-white fill-white" />
                                  </button>
                                ))}
                                {r.images?.map((im, imi) => (
                                  <button
                                    key={`tab-im-${imi}`}
                                    type="button"
                                    onClick={() =>
                                      setActiveMediaModal({
                                        url: getMediaUrl(im),
                                        type: "image",
                                        author: r.authorName || r.userName,
                                      })
                                    }
                                    className="relative h-9 w-9 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer shrink-0"
                                  >
                                    <img src={getMediaUrl(im)} alt="" className="h-full w-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic py-2">
                          No reviews yet. Be the first to review this product!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Customer Reviews & Ratings Section */}
        <section id="customer-reviews-section" className="mt-12 pt-10 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                COMMUNITY FEEDBACK
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase">
                CUSTOMER REVIEWS & RATINGS
              </h2>
            </div>
            <button
              type="button"
              onClick={openReviewModal}
              className="inline-flex items-center gap-2 rounded-none bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 4 Cols: Rating Breakdown Card */}
            <div className="lg:col-span-4 rounded-xl bg-neutral-50 p-6 border border-neutral-200/80">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-black text-neutral-950 tracking-tight">
                  {product.rating || (reviewStats?.average ? reviewStats.average.toFixed(1) : "4.5")}
                </span>
                <span className="text-sm font-semibold text-neutral-400">/ 5.0</span>
              </div>

              {/* Star visuals */}
              <div className="flex items-center gap-1 mb-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => {
                  const avg = Number(product.rating || reviewStats?.average || 4.5);
                  return (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 font-medium mb-6">
                Based on {reviews?.length || product.numReviews || 0} customer reviews
              </p>

              {/* Rating Distribution Bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewStats?.distribution?.[stars] || 0;
                  const total = reviews?.length || 1;
                  const pct = reviews?.length ? Math.round((count / total) * 100) : stars === 5 ? 85 : stars === 4 ? 12 : 3;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-12 font-semibold text-neutral-600">{stars} Star</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-neutral-400 text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% verified authentic customer feedback</span>
                </div>
              </div>
            </div>

            {/* Right 8 Cols: Reviews List */}
            <div className="lg:col-span-8 space-y-4">
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="rounded-xl border border-neutral-200 p-5 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center">
                            {(rev.authorName || rev.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-900">
                                {rev.authorName || rev.userName || "Verified Buyer"}
                              </span>
                              {(rev.isVerifiedPurchase || rev.user) && (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                  <Check className="h-2.5 w-2.5" />
                                  <span>Verified Purchase</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                          {rev.title}
                        </h4>
                      )}

                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                        {rev.comment}
                      </p>

                      {/* Attached Customer Photos & Videos */}
                      {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
                        <div className="pt-2.5 border-t border-neutral-100 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                            Customer Attached Media ({((rev.images?.length || 0) + (rev.videos?.length || 0))})
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Videos */}
                            {rev.videos?.map((vidUrl, vidIdx) => (
                              <button
                                key={`vid-${vidIdx}`}
                                type="button"
                                onClick={() =>
                                  setActiveMediaModal({
                                    url: getMediaUrl(vidUrl),
                                    type: "video",
                                    author: rev.authorName || rev.userName,
                                  })
                                }
                                className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-neutral-300 bg-black group hover:scale-105 transition cursor-pointer shadow-xs shrink-0"
                              >
                                <video
                                  src={getMediaUrl(vidUrl)}
                                  className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md">
                                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                  </div>
                                </div>
                                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[8px] font-bold text-white flex items-center gap-0.5">
                                  <Video className="h-2.5 w-2.5 text-rose-400" /> VIDEO
                                </span>
                              </button>
                            ))}

                            {/* Images */}
                            {rev.images?.map((imgUrl, imgIdx) => (
                              <button
                                key={`img-${imgIdx}`}
                                type="button"
                                onClick={() =>
                                  setActiveMediaModal({
                                    url: getMediaUrl(imgUrl),
                                    type: "image",
                                    author: rev.authorName || rev.userName,
                                  })
                                }
                                className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group hover:scale-105 transition cursor-pointer shadow-xs shrink-0"
                              >
                                <img
                                  src={getMediaUrl(imgUrl)}
                                  alt={`Customer photo ${imgIdx + 1}`}
                                  className="h-full w-full object-cover group-hover:opacity-95 transition"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end justify-end p-1">
                                  <span className="opacity-0 group-hover:opacity-100 transition rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    Enlarge
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center space-y-3 bg-neutral-50/50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    No customer reviews yet
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Be the first to share your thoughts on sizing, fabric, and styling for this piece.
                  </p>
                  <button
                    type="button"
                    onClick={openReviewModal}
                    className="inline-flex items-center gap-1.5 rounded-none bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Write the First Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

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
            related && related.length > 0
              ? related.slice(0, 8)
              : FEATURED_RECOMMENDATIONS.slice(0, 8);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 transition p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header with Product Snippet */}
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="h-12 w-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                <img
                  src={displayImages[0]}
                  alt={product?.name || "Product"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Write a Customer Review
                </span>
                <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">
                  {product?.name || "Product Review"}
                </h3>
              </div>
            </div>

            {/* Success message */}
            {reviewSuccessMsg ? (
              <div className="my-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800">{reviewSuccessMsg}</p>
                <p className="text-xs text-emerald-600">Updating product rating...</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                {/* 1. Rating Stars Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                      Overall Rating *
                    </label>
                    <span className="text-xs font-semibold text-neutral-500">
                      {(hoverRating || newRating) === 5
                        ? "5 Stars (Excellent!)"
                        : (hoverRating || newRating) === 4
                        ? "4 Stars (Very Good)"
                        : (hoverRating || newRating) === 3
                        ? "3 Stars (Good / Average)"
                        : (hoverRating || newRating) === 2
                        ? "2 Stars (Fair)"
                        : "1 Star (Poor)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const active = s <= (hoverRating || newRating);
                      return (
                        <button
                          type="button"
                          key={s}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(s)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              active
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300 hover:text-amber-200"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Reviewer Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Sharma"
                      value={newReviewerName}
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Email Address (Private)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rohan@example.com"
                      value={newReviewerEmail}
                      onChange={(e) => setNewReviewerEmail(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                {/* 3. Review Headline / Title */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Review Headline / Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Insane oversized fit, 10/10 heavyweight cotton!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                {/* 4. Detailed Comment */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What did you think of the fit, fabric quality, and comfort? Would you recommend it?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 p-3 text-xs text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none leading-relaxed"
                  />
                </div>

                {/* 5. Attach Photos or Videos (Optional - Non-mandatory) */}
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-neutral-700" />
                        <span>Add Photos or Video</span>
                        <span className="text-[10px] font-normal text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                          Optional
                        </span>
                      </label>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Share how it looks on you! (Max 5 photos, 2 videos • up to 50MB)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingMedia || reviewImages.length >= 5}
                        onClick={() => imageInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        <Camera className="h-3.5 w-3.5 text-indigo-600" />
                        <span>+ Photo ({reviewImages.length}/5)</span>
                      </button>

                      <button
                        type="button"
                        disabled={uploadingMedia || reviewVideos.length >= 2}
                        onClick={() => videoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        <Video className="h-3.5 w-3.5 text-rose-600" />
                        <span>+ Video ({reviewVideos.length}/2)</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUploadReviewMedia(e, 'image')}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleUploadReviewMedia(e, 'video')}
                  />

                  {/* Uploading indicator */}
                  {uploadingMedia && (
                    <div className="flex items-center gap-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 p-2 text-xs font-medium text-indigo-800">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Uploading media file to cloud storage...</span>
                    </div>
                  )}

                  {/* Upload error */}
                  {uploadMediaError && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {uploadMediaError}
                    </p>
                  )}

                  {/* Previews grid */}
                  {(reviewImages.length > 0 || reviewVideos.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Video Previews */}
                      {reviewVideos.map((vidUrl, idx) => (
                        <div
                          key={`vid-prev-${idx}`}
                          className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-neutral-300 bg-black shadow-xs group"
                        >
                          <video
                            src={getMediaUrl(vidUrl)}
                            className="h-full w-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow">
                              <Play className="h-3 w-3 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1 py-0.2 text-[8px] font-bold text-white">
                            VIDEO
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(idx)}
                            className="absolute top-1 right-1 rounded-full bg-neutral-900/90 text-white p-1 hover:bg-rose-600 transition cursor-pointer shadow"
                            title="Remove video"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Image Previews */}
                      {reviewImages.map((imgUrl, idx) => (
                        <div
                          key={`img-prev-${idx}`}
                          className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xs group"
                        >
                          <img
                            src={getMediaUrl(imgUrl)}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 rounded-full bg-neutral-900/90 text-white p-1 hover:bg-rose-600 transition cursor-pointer shadow"
                            title="Remove photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-lg bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            )}
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

      {/* Sizing Chart Modal */}
      <SizeChartModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        selectedSize={selectedSize}
        product={product}
        onSelectSize={(sz) => setSelectedSize(sz)}
      />

      {/* Customer Review Media Lightbox Modal */}
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveMediaModal(null)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white transition p-2 cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-neutral-900/80 rounded-full px-3 py-1 border border-white/20"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </button>

            {activeMediaModal.type === "video" ? (
              <video
                src={activeMediaModal.url}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={activeMediaModal.url}
                alt="Customer Review Photo"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl bg-black/40"
              />
            )}

            {activeMediaModal.author && (
              <p className="mt-3 text-xs font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                Shared by <strong className="text-white">{activeMediaModal.author}</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
