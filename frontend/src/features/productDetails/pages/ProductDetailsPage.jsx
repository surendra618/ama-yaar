import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
} from 'lucide-react';
import {
  fetchProductDetails,
  fetchProductReviews,
  submitProductReview,
  clearProductDetails,
} from '../productDetailsSlice';
import { addToCart } from '../../cart/cartSlice';
import { toggleWishlist } from '../../wishlist/wishlistSlice';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, related, reviews, reviewStats, loading } = useSelector(
    (state) => state.productDetails
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const [activeTab, setActiveTab] = useState('description');

  // Magnifying Zoom state for main product image
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Review form modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(clearProductDetails());
    dispatch(fetchProductDetails(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchProductReviews(product._id));
      if (product.variants?.length > 0) {
        if (product.variants[0].size) setSelectedSize(product.variants[0].size);
        if (product.variants[0].color) setSelectedColor(product.variants[0].color);
      }
    }
  }, [dispatch, product?._id]);

  if (loading || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item) === product._id || (item.slug && item.slug === product.slug)
  );

  const PLACEHOLDER_GALLERY = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
  ];

  const rawImages = (product.images || [])
    .filter(Boolean)
    .map((img) => (img.startsWith('http') || img.startsWith('data:') ? img : img.startsWith('/uploads') ? `http://localhost:5000${img}` : img));
  const displayImages = rawImages.length >= 4
    ? rawImages
    : [...rawImages, ...PLACEHOLDER_GALLERY].slice(0, 4);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        quantity,
        variant: { size: selectedSize, color: selectedColor },
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        quantity,
        variant: { size: selectedSize, color: selectedColor },
      })
    );
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    await dispatch(
      submitProductReview({
        productId: product._id,
        rating: newRating,
        comment: newComment,
      })
    );
    setSubmittingReview(false);
    setReviewModalOpen(false);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-black transition">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-black font-bold truncate max-w-md">{product.name}</span>
        </nav>

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white py-4">
          
          {/* Left Column: Main Big Image with Magnifying Zoom + 4 Thumbnails Below */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Main Featured Image Container with Interactive Zoom */}
            <div
              className="relative aspect-square w-full overflow-hidden bg-neutral-100 cursor-zoom-in select-none group"
              onMouseEnter={() => setIsHoveringZoom(true)}
              onMouseLeave={() => setIsHoveringZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={displayImages[selectedImage] || displayImages[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-transform duration-150 ease-out"
                style={{
                  transform: isHoveringZoom ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />

              {/* Hover Zoom Indicator Badge */}
              {!isHoveringZoom && (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md flex items-center gap-1.5 pointer-events-none shadow-md">
                  <Sparkles className="h-3 w-3 text-amber-400" /> Hover to Zoom
                </span>
              )}

              {product.discount > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-md pointer-events-none">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* 4 Thumbnails Gallery Below Main Image */}
            <div className="grid grid-cols-4 gap-3">
              {displayImages.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden border transition-all duration-200 ${
                    selectedImage === idx
                      ? 'border-black ring-1 ring-black scale-[0.98] opacity-100'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {selectedImage === idx && (
                    <div className="absolute inset-0 bg-black/5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Brand & Title */}
            <div className="mb-3">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">
                {product.brand || product.category?.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Verified reviews */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-800 ring-1 ring-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating || '4.8'}</span>
                <span className="text-neutral-400 font-normal">({product.numReviews || 78} reviews)</span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> 100% Genuine Guaranteed
              </span>
            </div>

            {/* Featured Description & Special Offer Overview */}
            <div className="mb-5 space-y-3">
              {/* Special Offer Pill */}
              <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900 border border-amber-200">
                <Tag className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Special Offer: Use code <strong className="text-black font-black uppercase underline decoration-amber-400">AMA10</strong> for Extra 10% OFF</span>
              </div>

              {/* Rich Description Overview Box */}
              <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed bg-neutral-50/90 p-4 rounded-md border border-neutral-200/70 space-y-3">
                <p className="font-medium text-neutral-800 leading-relaxed">
                  {product.description || 'Crafted with premium high-quality long-staple cotton for ultimate breathability, enduring elegance, and a flawless modern fit.'}
                </p>

                {/* Key Feature Checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-800 pt-1 border-t border-neutral-200/60">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>100% Ultra-Soft Fabric</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Breathable & All-Day Fit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Color-Fast & Pre-Shrunk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Reinforced Stitching</span>
                  </div>
                </div>
              </div>

              {/* Quick Spec Badges Strip */}
              <div className="flex flex-wrap gap-2 text-[11px] font-bold text-neutral-600">
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">Fabric: 100% Cotton</span>
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">Fit: Modern Slim Fit</span>
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">Care: Machine Wash</span>
                <span className="bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">Dispatch: 24 Hours</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-6 rounded-md bg-neutral-50 p-4 border border-neutral-100 flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    ₹{product.mrp?.toLocaleString('en-IN')}
                  </span>
                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                    Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Variants (Sizes & Colors) */}
            {product.variants?.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.some((v) => v.size) && (
                  <div>
                    <span className="text-xs font-bold text-neutral-800 mb-2 block uppercase tracking-wider">Select Option / Size:</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`rounded-md px-4 py-2 text-xs font-bold transition ${
                            selectedSize === sz
                              ? 'bg-black text-white shadow-sm'
                              : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.variants.some((v) => v.color) && (
                  <div>
                    <span className="text-xs font-bold text-neutral-800 mb-2 block uppercase tracking-wider">Select Color / Finish:</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))).map((cl) => (
                        <button
                          key={cl}
                          onClick={() => setSelectedColor(cl)}
                          className={`rounded-md px-4 py-2 text-xs font-bold transition ${
                            selectedColor === cl
                              ? 'bg-black text-white shadow-sm'
                              : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          {cl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Stock Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center rounded-md border border-neutral-200 bg-neutral-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-md bg-white font-bold text-neutral-700 shadow-xs hover:bg-neutral-100 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-neutral-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 rounded-md bg-white font-bold text-neutral-700 shadow-xs hover:bg-neutral-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
              </span>
            </div>

            {/* Action Buttons — Normal Rounded Buttons (rounded-md) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex items-center justify-center gap-2 rounded-md py-3.5 text-xs font-extrabold shadow-md transition duration-200 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                }`}
              >
                {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4 stroke-[2.5]" />}
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex items-center justify-center gap-2 rounded-md bg-black py-3.5 text-xs font-extrabold text-white shadow-md shadow-black/20 hover:bg-neutral-800 transition duration-200"
              >
                <Zap className="h-4 w-4 fill-white text-white" /> Buy Now
              </button>
            </div>

            {/* Wishlist & Share row */}
            <div className="flex items-center gap-4 border-t border-neutral-100 pt-4 text-xs font-semibold">
              <button
                onClick={() => {
                  if (!isAuthenticated) return navigate('/login');
                  dispatch(toggleWishlist(product._id));
                }}
                className={`flex items-center gap-1.5 transition ${
                  isWishlisted ? 'text-rose-600 font-bold' : 'text-neutral-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Trust Features Strip */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-neutral-700 font-medium bg-neutral-50 p-3 rounded-md border border-neutral-100">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>7 Days Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
            </div>

            {/* Pincode checker */}
            <div className="mt-4 rounded-md border border-neutral-100 bg-neutral-50/70 p-3.5">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
                <MapPin className="h-4 w-4 text-indigo-600" /> Delivery & Services
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 focus:outline-hidden"
                />
                <button
                  onClick={() => setPincodeChecked(pincode.length === 6)}
                  className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Express delivery available by{' '}
                  {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specifications & Description Interactive Tabs */}
        <div className="mt-12 bg-white pt-6 border-t border-neutral-200">
          
          {/* Tab Navigation Row */}
          <div className="flex border-b border-neutral-200 gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Description & Features' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'care', label: 'Wash & Care Guide' },
              { id: 'shipping', label: 'Shipping & Returns' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="py-6">
            {/* Tab 1: Description & Features (Extensive Rich Content) */}
            {activeTab === 'description' && (
              <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
                
                {/* Section 1: Detailed Story & Overview */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">Craftsmanship & Product Story</h3>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    {product.description ||
                      'Crafted from 100% long-staple Egyptian cotton, this crisp button-down Oxford shirt offers enduring elegance, breathability, and seamless wrinkle resistance for the modern gentleman.'}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                    Engineered using a high-density 2-ply basketweave technique, every thread is garment bio-washed to deliver a silky-soft handfeel right out of the box with zero shrinkage or color fading over time. The tailored ergonomic silhouette accentuates a natural athletic frame while allowing full freedom of movement throughout your day.
                  </p>
                </div>

                {/* Section 2: Styling & Fit Guide */}
                <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200/80 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Style & Fit Recommendation
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    • <strong>Smart Casual / Office:</strong> Tuck into tailored chinos or dark trousers and pair with leather loafers for an effortlessly sharp corporate look.
                    <br />
                    • <strong>Weekend & Party Wear:</strong> Wear untucked over slim-fit denim or unbutton over a clean white crew-neck tee for an understated streetwear vibe.
                  </p>
                </div>

                {/* Section 3: 10 Comprehensive Key Features */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Comprehensive Feature Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-neutral-800">
                    {[
                      { title: '100% Long-Staple Egyptian Cotton', desc: 'Sourced from premium extra-long staple yarn for exceptional softness and longevity.' },
                      { title: 'Wrinkle-Resistant Breathable Weave', desc: 'Stays crisp and fresh all day with minimal ironing required.' },
                      { title: 'Mother-of-Pearl Finish Buttons', desc: 'Hand-stitched cross-locked buttons that stay securely attached.' },
                      { title: 'Tailored Slim-Fit Precision', desc: 'Ergonomically cut armholes and tapered waist for a sleek silhouette.' },
                      { title: 'Pre-Shrunk & Color-Fast Guarantee', desc: 'Garment bio-washed to maintain exact size and vibrant tone wash after wash.' },
                      { title: 'Reinforced Fused Collar & Cuffs', desc: 'Interlined collar holds its sharp structure without curling or fraying.' },
                      { title: 'Double-Needle Seam Construction', desc: 'Double-stitched flat-felled side seams for maximum structural strength.' },
                      { title: 'Versatile Curved Hemline', desc: 'Designed to look equally sharp tucked in or worn relaxed untucked.' },
                      { title: 'Hypoallergenic & Skin-Friendly', desc: 'Zero synthetic blends or harsh chemicals, gentle on sensitive skin.' },
                      { title: 'All-Season Temperature Control', desc: 'Natural cotton fibers keep you cool in summer and warm in winter.' },
                    ].map((feature, i) => (
                      <div key={i} className="bg-neutral-50 p-3 rounded-md border border-neutral-100 flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3] mt-0.5" />
                        <div>
                          <div className="font-bold text-black text-xs">{feature.title}</div>
                          <div className="text-[11px] text-neutral-500 font-normal leading-snug mt-0.5">{feature.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Why Choose AMA YAAR Quality Assurance */}
                <div className="border-t border-neutral-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs font-semibold text-neutral-700">
                  <div className="p-3 bg-neutral-50/70 rounded-md border border-neutral-100">
                    <div className="text-lg mb-1">💎</div>
                    <div className="font-bold text-black">Direct-to-Consumer Value</div>
                    <div className="text-[10px] text-neutral-500 font-normal mt-0.5">Luxury quality without middleman retail markups.</div>
                  </div>
                  <div className="p-3 bg-neutral-50/70 rounded-md border border-neutral-100">
                    <div className="text-lg mb-1">⚡</div>
                    <div className="font-bold text-black">24-Hour Express Dispatch</div>
                    <div className="text-[10px] text-neutral-500 font-normal mt-0.5">Shipped in eco-friendly protective packaging.</div>
                  </div>
                  <div className="p-3 bg-neutral-50/70 rounded-md border border-neutral-100">
                    <div className="text-lg mb-1">🛡️</div>
                    <div className="font-bold text-black">100% Quality Assurance</div>
                    <div className="text-[10px] text-neutral-500 font-normal mt-0.5">7-Day easy returns & exchanges guaranteed.</div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Specifications Table */}
            {activeTab === 'specifications' && (
              <div className="animate-in fade-in duration-200 max-w-3xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-3">Technical Specifications</h3>
                <div className="overflow-hidden rounded-md border border-neutral-200">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-neutral-100">
                      {[
                        { name: 'Fabric', value: '100% Combed Pure Egyptian Cotton' },
                        { name: 'Fit', value: 'Tailored Slim Fit' },
                        { name: 'Collar Style', value: 'Button-Down Oxford Collar' },
                        { name: 'Sleeve Length', value: 'Full Sleeve with Adjustable Cuffs' },
                        { name: 'Pattern', value: 'Solid Oxford Weave' },
                        { name: 'Country of Origin', value: 'India' },
                      ].map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50/60' : 'bg-white'}>
                          <td className="w-1/3 py-3 px-4 font-bold text-neutral-800 uppercase tracking-wider text-[11px]">{spec.name}</td>
                          <td className="py-3 px-4 text-neutral-700 font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Wash & Care Guide */}
            {activeTab === 'care' && (
              <div className="animate-in fade-in duration-200 max-w-3xl space-y-3 text-xs text-neutral-700 font-medium">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-2">Fabric Care Instructions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200/80 flex items-start gap-2.5">
                    <span className="text-lg">🧼</span>
                    <div>
                      <h4 className="font-bold text-black text-xs">Machine Wash Cold</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Gentle cycle at 30°C with like colors.</p>
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200/80 flex items-start gap-2.5">
                    <span className="text-lg">☀️</span>
                    <div>
                      <h4 className="font-bold text-black text-xs">Line Dry / Tumble Low</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Hang dry in shade to preserve crisp color.</p>
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200/80 flex items-start gap-2.5">
                    <span className="text-lg">👔</span>
                    <div>
                      <h4 className="font-bold text-black text-xs">Warm Iron</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Iron on medium heat if crisp finish is desired.</p>
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200/80 flex items-start gap-2.5">
                    <span className="text-lg">🚫</span>
                    <div>
                      <h4 className="font-bold text-black text-xs">Do Not Bleach</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Avoid harsh chemical detergents or dry cleaning.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Shipping & Returns */}
            {activeTab === 'shipping' && (
              <div className="animate-in fade-in duration-200 max-w-3xl space-y-4 text-xs text-neutral-700 font-medium">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-1">Shipping & Return Policies</h3>
                <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-black">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    <span>Free Express Shipping Across India</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed pl-6">
                    All orders are processed and dispatched within 24 hours. Estimated delivery time is 2-4 business days.
                  </p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-black">
                    <RotateCcw className="h-4 w-4 text-indigo-600" />
                    <span>Hassle-Free 7-Day Returns & Exchanges</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed pl-6">
                    If the item doesn't fit or meet your expectations, return or exchange it easily within 7 days of delivery.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-10 bg-white py-6 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-black">Customer Ratings & Reviews</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl font-black text-black">4.8</span>
                <div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 font-semibold mt-0.5">Based on 78 Verified Customer Reviews</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) return navigate('/login');
                setReviewModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-6 py-3 text-xs font-extrabold text-white uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
            >
              <MessageSquare className="h-4 w-4" /> Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">No customer reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="rounded-md bg-neutral-50 p-4 border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">
                        {rev.user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-bold text-black">{rev.user?.name || 'Verified Buyer'}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400 mb-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* You Might Also Like — Related Products Section */}
        {(() => {
          const FEATURED_RECOMMENDATIONS = [
            {
              _id: 'rec_1',
              name: 'Oversized Stylish Graphic T-shirt',
              brand: 'AMA YAAR',
              price: 450,
              mrp: 899,
              discount: 50,
              rating: 4.8,
              numReviews: 124,
              images: ['/model01.png', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
              category: { name: 'Men Fashion', slug: 'men-fashion' },
              stock: 25,
            },
            {
              _id: 'rec_2',
              name: 'Sleeveless Acid Wash Casual Vest',
              brand: 'URBAN FITS',
              price: 599,
              mrp: 1199,
              discount: 50,
              rating: 4.7,
              numReviews: 86,
              images: ['/model04.png', 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80'],
              category: { name: 'Streetwear', slug: 'streetwear' },
              stock: 18,
            },
            {
              _id: 'rec_3',
              name: 'Classic Zipper Polo T-Shirt',
              brand: 'RAYMOND',
              price: 899,
              mrp: 1799,
              discount: 50,
              rating: 4.9,
              numReviews: 210,
              images: ['/model03.png', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'],
              category: { name: 'Polos', slug: 'polos' },
              stock: 30,
            },
            {
              _id: 'rec_4',
              name: 'Vintage Wash Denim Casual Shirt',
              brand: 'LEVIS',
              price: 1299,
              mrp: 2499,
              discount: 48,
              rating: 4.6,
              numReviews: 95,
              images: ['/model02.png', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80'],
              category: { name: 'Shirts', slug: 'shirts' },
              stock: 12,
            },
            {
              _id: 'rec_5',
              name: 'Vintage Graphic Urban Tee',
              brand: 'AMA YAAR',
              price: 499,
              mrp: 999,
              discount: 50,
              rating: 4.8,
              numReviews: 112,
              images: ['/model05.jpg', 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80'],
              category: { name: 'Graphic Tees', slug: 'graphic-tees' },
              stock: 20,
            },
            {
              _id: 'rec_6',
              name: 'Acid Wash Denim Street Jacket',
              brand: 'DENIM CO',
              price: 1499,
              mrp: 2999,
              discount: 50,
              rating: 4.9,
              numReviews: 145,
              images: ['/boyse.png', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80'],
              category: { name: 'Jackets', slug: 'jackets' },
              stock: 15,
            },
            {
              _id: 'rec_7',
              name: 'Urban Zipper Polo Shirt',
              brand: 'ZARA FITS',
              price: 799,
              mrp: 1599,
              discount: 50,
              rating: 4.7,
              numReviews: 78,
              images: ['/side.png', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80'],
              category: { name: 'Polos', slug: 'polos' },
              stock: 22,
            },
            {
              _id: 'rec_8',
              name: 'Streetwear Casual Oversized Tee',
              brand: 'AMA YAAR',
              price: 549,
              mrp: 1099,
              discount: 50,
              rating: 4.8,
              numReviews: 160,
              images: ['/model07.jpg', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80'],
              category: { name: 'Streetwear', slug: 'streetwear' },
              stock: 28,
            },
            {
              _id: 'rec_9',
              name: 'Tactical Cargo Oversized Sweatshirt',
              brand: 'AMA YAAR',
              price: 999,
              mrp: 1999,
              discount: 50,
              rating: 4.9,
              numReviews: 215,
              images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80', '/model01.png'],
              category: { name: 'Sweatshirts', slug: 'sweatshirts' },
              stock: 19,
            },
            {
              _id: 'rec_10',
              name: 'Minimalist Heavyweight Cotton Hoodie',
              brand: 'URBAN FITS',
              price: 1299,
              mrp: 2599,
              discount: 50,
              rating: 4.8,
              numReviews: 184,
              images: ['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80', '/model03.png'],
              category: { name: 'Hoodies', slug: 'hoodies' },
              stock: 24,
            },
            {
              _id: 'rec_11',
              name: 'Relaxed Fit Street Chino Trousers',
              brand: 'ZARA FITS',
              price: 1199,
              mrp: 2399,
              discount: 50,
              rating: 4.7,
              numReviews: 92,
              images: ['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=80', '/boyse.png'],
              category: { name: 'Trousers', slug: 'trousers' },
              stock: 16,
            },
            {
              _id: 'rec_12',
              name: 'Premium Embroidered Street Cap',
              brand: 'AMA YAAR',
              price: 399,
              mrp: 799,
              discount: 50,
              rating: 4.9,
              numReviews: 310,
              images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80', '/side.png'],
              category: { name: 'Accessories', slug: 'accessories' },
              stock: 35,
            },
          ];

          const displayRelated = (related && related.length >= 12)
            ? related
            : [...(related || []), ...FEATURED_RECOMMENDATIONS].slice(0, 12);

          return (
            <div className="mt-14 pt-8 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 block mb-1">Recommended For You</span>
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

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
            <h3 className="text-base font-bold text-slate-900 mb-4">Review this Product</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Rating:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-6 w-6 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Feedback:</label>
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
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
