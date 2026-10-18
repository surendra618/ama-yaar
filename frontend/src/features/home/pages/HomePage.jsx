import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Play,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Pause,
  X,
  ShoppingBag,
  Quote,
} from "lucide-react";
import { toggleWishlist } from "../../wishlist/wishlistSlice";

// lucide-react no longer ships brand marks.
const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
import {
  fetchProducts,
  fetchCategories,
  fetchBanners,
} from "../../products/productsSlice";
import ProductCard from "../../../components/ProductCard";
import InstagramBanner from "../../../components/InstagramBanner";
import EditorialBanner from "../../../components/EditorialBanner";
import TopPicksBanner from "../../../components/TopPicksBanner";

import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const HERO_SLIDES = [
  {
    bgImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85",
    eyebrow: "New Season 2026",
    title1: "GEAR UP",
    title2: "EVERY SEASON",
    title3: "2026 EDITION",
    subtitle: "For the ones who move different. High-performance streetwear.",
    link: "/products",
    buttonText: "SHOP NOW",
  },
  {
    bgImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85",
    eyebrow: "Summer Drop 2026",
    title1: "RAW STREET",
    title2: "HEAVYWEIGHT COTTON",
    title3: "OVERSIZED DRIP",
    subtitle: "240+ GSM signature vintage washed boxy fits.",
    link: "/products?search=oversized",
    buttonText: "EXPLORE DROP",
  },
  {
    bgImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85",
    eyebrow: "Limited Edition Drops",
    title1: "ACID WASH",
    title2: "STYLE KA LAFDA",
    title3: "SIGNATURE RUN",
    subtitle: "Engineered for comfort and unfiltered street presence.",
    link: "/products?search=acid+wash",
    buttonText: "SHOP ACID WASH",
  },
  {
    bgImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=85",
    eyebrow: "Curated Essentials",
    title1: "STREET CARGO",
    title2: "BAGGY DENIM",
    title3: "AESTHETIC FITS",
    subtitle: "Redefining modern urban streetwear culture across India.",
    link: "/products?search=cargo",
    buttonText: "VIEW LOOKBOOK",
  },
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
  "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
];

const REEL_ITEMS = [
  {
    id: 1,
    title: "Oversized Stylish Men T-shirt",
    price: 450,
    mrp: 899,
    discount: "50% OFF",
    views: "18.4K views",
    badge: "Top Selling",
    poster: "/model01.png",
    altPoster: "/model04.png",
    video: "/video/video5.mp4",
    altVideo: "/video/video5.mp4",
  },
  {
    id: 2,
    title: "Vintage Acid Wash Graphic Tee",
    price: 599,
    mrp: 1199,
    discount: "50% OFF",
    views: "24.1K views",
    badge: "Trending Drop",
    poster: "/model04.png",
    altPoster: "/model03.png",
    video: "/video/video1.mp4",
    altVideo: "/video/video1.mp4",
  },
  {
    id: 3,
    title: "Urban Streetwear Heavyweight Tee",
    price: 499,
    mrp: 999,
    discount: "50% OFF",
    views: "31.8K views",
    badge: "Best Value",
    poster: "/model03.png",
    altPoster: "/model01.png",
    video: "/video/video2.mp4",
    altVideo: "/video/video2.mp4",
  },
  {
    id: 4,
    title: "Original Artwork Oversized Fit",
    price: 550,
    mrp: 1099,
    discount: "50% OFF",
    views: "12.9K views",
    badge: "Limited Drop",
    poster: "/model07.jpg",
    altPoster: "/model08.jpg",
    video: "/video/video3.mp4",
    altVideo: "/video/video3.mp4",
  },
  {
    id: 5,
    title: "Street Culture Denim Jacket Outfit",
    price: 899,
    mrp: 1799,
    discount: "50% OFF",
    views: "45.3K views",
    badge: "Hot Right Now",
    poster: "/model05.jpg",
    altPoster: "/model01.png",
    video: "/video/video3%20(2).mp4",
    altVideo: "/video/video3 (2).mp4",
  },
];

function AnimatedReelMotion({ title }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-900 flex flex-col items-center justify-center text-slate-400">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 pointer-events-none" />
      <div className="z-10 flex flex-col items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-inner">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Loading Video...
        </span>
      </div>
    </div>
  );
}

function ReelCard({ item, onOpenModal, reelsCount }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => setHasError(true));
          }
        });
      }
    }
  }, [isMuted]);

  const handleProductClick = (e) => {
    e.stopPropagation();
    if (item.productId) {
      navigate(`/products/${item.productId}`);
    } else {
      navigate("/products");
    }
  };

  const aspectClass = reelsCount === 4 ? "aspect-[9/11.2]" : "aspect-[9/14]";

  return (
    <div className="group flex flex-col cursor-pointer select-none overflow-hidden rounded-none border-[0.2px] border-white/15 shadow-md">
      {/* Card video container */}
      <div
        onClick={handleProductClick}
        className={`relative ${aspectClass} w-full overflow-hidden bg-neutral-950`}
      >
        {hasError ? (
          <AnimatedReelMotion title={item.title} />
        ) : (
          /* Live video plays continuously by default */
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          >
            <source src={item.video} type="video/mp4" />
            <source src={item.altVideo} type="video/mp4" />
            <source src="/Recording 2026-09-30 160246.mp4" type="video/mp4" />
          </video>
        )}

        {/* Top Left Red Ribbon Badge — Anchored to left edge slightly lower down */}
        <span className="absolute left-0 top-2.5 z-20 rounded-r-full bg-[#b80000] px-3 py-1 text-[11px] font-normal text-white shadow-xs pointer-events-none leading-none">
          {item.badge || "Top selling"}
        </span>

        {/* Top Right Heart Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert("Added to Wishlist!");
          }}
          className="absolute right-2 top-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-xs hover:bg-white transition"
          title="Add to Wishlist"
        >
          <Heart className="h-3.5 w-3.5 text-slate-700" />
        </button>

        {/* Solid White Center Play Icon */}
        <span className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="flex h-12 w-12 items-center justify-center transition-transform duration-300 group-hover:scale-115">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 fill-white text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </span>

        {/* Smooth Gradient Overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        {/* Top Overlay Row inside video: Views count on Left + 2 Thumbnails on Right */}
        <div className="absolute bottom-16 left-2.5 right-2.5 z-20 flex items-end justify-between gap-1.5 pointer-events-none">
          {/* Eye Icon & View Count on Left */}
          <div className="flex items-center gap-1 text-white/90 font-bold whitespace-nowrap shrink-0 mb-0.5">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[10.5px] sm:text-[11.5px] tracking-wide font-extrabold">
              {item.views || "13.6K views"}
            </span>
          </div>

          {/* 2 Separate Model Thumbnails on Right — Identical Size & Border */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <img
              src={item.poster || "/model01.png"}
              alt="Product 1 Thumbnail"
              title={item.title}
              onClick={(e) => {
                e.stopPropagation();
                if (item.productId) {
                  navigate(`/products/${item.productId}`);
                } else {
                  onOpenModal(item);
                }
              }}
              className="h-11 w-10 sm:h-12 sm:w-10.5 rounded-none border-2 border-white object-cover object-center shadow-md bg-neutral-900 shrink-0 cursor-pointer hover:scale-105 transition"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80";
              }}
            />
            <img
              src={item.altPoster || "/model04.png"}
              alt="Product 2 Thumbnail"
              title={item.product2Title || item.title}
              onClick={(e) => {
                e.stopPropagation();
                if (item.product2Id) {
                  navigate(`/products/${item.product2Id}`);
                } else if (item.productId) {
                  navigate(`/products/${item.productId}`);
                } else {
                  onOpenModal(item);
                }
              }}
              className="h-11 w-10 sm:h-12 sm:w-10.5 rounded-none border-2 border-white object-cover object-center shadow-md bg-neutral-900 shrink-0 cursor-pointer hover:scale-105 transition"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80";
              }}
            />
          </div>
        </div>

        {/* 100% Full-width Edge-to-Edge Translucent Title & Price Box — Reel video visible underneath */}
        <div
          onClick={handleProductClick}
          className="absolute inset-x-0 bottom-0 z-20 bg-black/40 backdrop-blur-xs px-3 py-2 border-t border-white/10 flex flex-col gap-0.5 cursor-pointer hover:bg-black/65 transition"
        >
          <p className="truncate text-[12px] sm:text-[12.5px] font-bold text-white leading-tight drop-shadow-md">
            {item.title}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-[13.5px] sm:text-[14.5px] drop-shadow-md">
              Rs. {Number(item.price || 450).toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-white/70 line-through font-normal drop-shadow-sm">
              Rs. {Number(item.mrp || 899).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Full-width Centered Dark Button Bar */}
      <button
        onClick={handleProductClick}
        className="w-full py-2.5 text-center text-[12px] font-bold uppercase tracking-wider text-white bg-[#222222] hover:bg-black transition cursor-pointer border-t border-neutral-800 flex items-center justify-center gap-1.5"
      >
        <span>{item.productId ? "View Product" : "Add to cart"}</span>
      </button>
    </div>
  );
}

function ReelShoppingModal({ reel, onClose, onNext, onPrev }) {
  const navigate = useNavigate();
  const modalVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = isMuted;
      const promise = modalVideoRef.current.play();
      if (promise !== undefined) {
        promise.catch(() => {
          if (modalVideoRef.current) {
            modalVideoRef.current.muted = true;
            setIsMuted(true);
            modalVideoRef.current.play().catch(() => setHasError(true));
          }
        });
      }
    }
  }, [reel, isMuted]);

  if (!reel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Modal Wrapper */}
      <div className="relative flex h-full max-h-[85vh] w-full max-w-[420px] flex-col overflow-hidden bg-neutral-950 shadow-2xl border border-white/20">
        {/* Top Header */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#facc15] font-black text-black text-xs shadow-md">
              AY
            </span>
            <div>
              <p className="text-xs font-black text-white tracking-wide">
                amayaan.in
              </p>
              <p className="text-[10px] text-white/60 font-semibold">
                {reel.views}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition border border-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white/80" />
              ) : (
                <Volume2 className="h-4 w-4 text-[#facc15]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition border border-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Center Video Player */}
        <div
          className="relative flex-1 bg-black overflow-hidden cursor-pointer"
          onClick={() => {
            if (modalVideoRef.current) {
              if (isPlaying) {
                modalVideoRef.current.pause();
                setIsPlaying(false);
              } else {
                modalVideoRef.current.play().catch(() => setHasError(true));
                setIsPlaying(true);
              }
            }
          }}
        >
          {hasError ? (
            <AnimatedReelMotion title={reel.title} />
          ) : (
            <video
              ref={modalVideoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setHasError(true)}
              className="h-full w-full object-cover"
            >
              <source src={reel.video} type="video/mp4" />
              <source src={reel.altVideo} type="video/mp4" />
              <source src="/Recording 2026-09-30 160246.mp4" type="video/mp4" />
            </video>
          )}

          {!isPlaying && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#facc15]/90 text-black shadow-2xl">
                <Play className="h-8 w-8 fill-black ml-1" />
              </span>
            </div>
          )}
        </div>

        {/* Navigation Side Controls */}
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition border border-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition border border-white/20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Bottom Product Reel Shopping Drawer */}
        <div className="relative z-30 bg-neutral-900/95 border-t border-white/10 p-4 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-black bg-[#facc15]">
              {reel.badge}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {reel.discount}
            </span>
          </div>

          <div
            className={reel.productId ? "cursor-pointer hover:opacity-90" : ""}
            onClick={() => {
              if (reel.productId) {
                onClose();
                navigate(`/products/${reel.productId}`);
              }
            }}
          >
            <h4 className="text-sm font-black text-white tracking-wide truncate flex items-center gap-1.5">
              <span>{reel.title}</span>
              {reel.productId && (
                <ArrowUpRight className="h-4 w-4 text-[#facc15] shrink-0" />
              )}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base font-black text-white">
                Rs. {reel.price}
              </span>
              <span className="text-xs text-white/40 line-through font-medium">
                Rs. {reel.mrp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_ITEMS = [
  {
    name: "Oversized Printed",
    image: "/model01.png",
    fallback:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    slug: "oversized-printed",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-0",
  },
  {
    name: "Sleeveless Acid wash",
    image: "/model04.png",
    fallback:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80",
    slug: "sleeveless-acid-wash",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-20",
  },
  {
    name: "Polo T-Shirt",
    image: "/model03.png",
    fallback:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    slug: "polo-t-shirt",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-0",
  },
  {
    name: "Henley T-Shirt",
    image: "/model02.png",
    fallback:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    slug: "henley-t-shirt",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-20",
  },
  {
    name: "Vintage Graphic",
    image: "/model05.jpg",
    fallback:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
    slug: "vintage-graphic",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-0",
  },
  {
    name: "Acid Wash Denim",
    image: "/boyse.png",
    fallback:
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
    slug: "acid-wash-denim",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-20",
  },
  {
    name: "Urban Zipper Polo",
    image: "/side.png",
    fallback:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    slug: "urban-zipper-polo",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-0",
  },
  {
    name: "Streetwear Casual",
    image: "/model07.jpg",
    fallback:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    slug: "streetwear-casual",
    cardStyle: "h-[310px] sm:h-[350px] sm:mt-20",
  },
];

const REVIEWS = [
  {
    name: "Vansh Singh",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    text: "Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!",
  },
  {
    name: "Arjun Yadav",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    text: "Henley T-shirt meri favourite purchase rahi! Comfortable, stylish aur perfect fitting. Quality dekhkar honestly expectations se better laga.",
  },
  {
    name: "Sunil Kashyap",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    text: "Oversized t-shirt ka fabric kaafi soft hai aur fitting bhi achhi hai. Pehli baar order kiya tha, but quality expected se better nikli.",
  },
  {
    name: "Rohan Verma",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80",
    text: "Amaze quality! Zipper jacket ki fitting aur stitching bilkul top notch hai. Delivery fast thi aur packaging premium lagti hai.",
  },
  {
    name: "Ved Singh",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80",
    text: "Heavyweight graphic tee ka print aur fabric unmatched hai. Wash ke baad bhi color aur shape fade nahi hota.",
  },
  {
    name: "Kabir Sharma",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80",
    text: "Minimal streetwear look ke liye ye brand best hai. Comfort level 10/10. Definitely recommendation worthy!",
  },
  {
    name: "Aditya Gupta",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80",
    text: "Fabric aur drop shoulder design exact trendy vibe deta hai. Ordering again for my brothers!",
  },
  {
    name: "Aarav Mehta",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    text: "Super impressed with the fitting and material softness. Best online shopping experience so far.",
  },
];

const categoryContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const categoryCardVariants = {
  hidden: { opacity: 0, y: 45, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14,
    },
  },
};

const productGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.08,
    },
  },
};

const productCardVariants = {
  hidden: { opacity: 0, x: -80, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 13,
      mass: 0.75,
    },
  },
};

function TypewriterBannerTitle({
  line1,
  line2,
  line3,
  highlightColor = "#facc15",
  textColor = "text-white",
}) {
  const ref = useRef(null);
  const [typed1, setTyped1] = useState("");
  const [typed2, setTyped2] = useState("");
  const [typed3, setTyped3] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.25 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    // Delay typing slightly so card has time to slide in first
    const startDelay = setTimeout(() => {
      setIsTyping(true);

      // 1. Type line1
      let t1 = 0;
      const int1 = setInterval(() => {
        t1++;
        setTyped1(line1.slice(0, t1));
        if (t1 >= line1.length) {
          clearInterval(int1);

          // 2. Type line2
          let t2 = 0;
          const int2 = setInterval(() => {
            t2++;
            setTyped2(line2.slice(0, t2));
            if (t2 >= line2.length) {
              clearInterval(int2);

              // 3. Type line3
              let t3 = 0;
              const int3 = setInterval(() => {
                t3++;
                setTyped3(line3.slice(0, t3));
                if (t3 >= line3.length) {
                  clearInterval(int3);
                  setIsTyping(false);
                }
              }, 60);
            }
          }, 55);
        }
      }, 50);
    }, 450);

    return () => clearTimeout(startDelay);
  }, [started, line1, line2, line3]);

  return (
    <h3
      ref={ref}
      className={`mt-3 font-black leading-[1.05] uppercase min-h-[3.3em] select-none ${textColor}`}
      style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}
    >
      <span className="block drop-shadow-sm">{started ? typed1 : line1}</span>
      <span className="block drop-shadow-sm">{started ? typed2 : line2}</span>
      <span style={{ color: highlightColor }} className="drop-shadow-sm">
        {started ? typed3 : line3}
        {isTyping && typed3.length < line3.length && (
          <span className="inline-block w-[3px] h-[0.8em] bg-current ml-1 rounded-full animate-pulse" />
        )}
      </span>
    </h3>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: products,
    categories,
    banners,
  } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector(
    (state) => state.wishlist || { items: [] },
  );
  const categoryRailRef = useRef(null);
  const isCategoryHoveredRef = useRef(false);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [dbReels, setDbReels] = useState([]);
  const [reelsDisplayCount, setReelsDisplayCount] = useState(() => {
    return Number(localStorage.getItem("reels_display_count")) || 4;
  });

  useEffect(() => {
    const handleSettingChange = () => {
      const stored = Number(localStorage.getItem("reels_display_count")) || 4;
      setReelsDisplayCount(stored);
    };

    let bc;
    try {
      bc = new BroadcastChannel("reels_setting_channel");
      bc.onmessage = (e) => {
        if (e.data && e.data.displayCount) {
          setReelsDisplayCount(e.data.displayCount);
          localStorage.setItem(
            "reels_display_count",
            e.data.displayCount.toString(),
          );
        }
      };
    } catch (_) {}

    window.addEventListener("reels_setting_changed", handleSettingChange);
    window.addEventListener("storage", handleSettingChange);

    return () => {
      window.removeEventListener("reels_setting_changed", handleSettingChange);
      window.removeEventListener("storage", handleSettingChange);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const loadReels = () => {
      fetch("http://localhost:5000/api/v1/reels")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.data) {
            const reelList = Array.isArray(resData.data)
              ? resData.data
              : resData.data.reels || [];
            if (reelList.length > 0) {
              setDbReels(reelList);
            }
            const count = resData.displayCount || resData.data.displayCount;
            if (count) {
              setReelsDisplayCount(count);
              localStorage.setItem("reels_display_count", count.toString());
            }
          }
        })
        .catch(() => {});
    };

    loadReels();

    window.addEventListener("focus", loadReels);
    const interval = setInterval(loadReels, 4000);
    return () => {
      window.removeEventListener("focus", loadReels);
      clearInterval(interval);
    };
  }, []);

  const displayReels =
    dbReels.length > 0
      ? dbReels.map((r, idx) => ({
          id: r._id || idx,
          productId: r.product?._id || r.product || null,
          product2Id: r.product2?._id || r.product2 || null,
          product2Title: r.product2?.name || "",
          title: r.product?.name || r.title,
          price: r.product?.price || r.price,
          mrp: r.product?.mrp || r.mrp,
          discount: r.discount || "50% OFF",
          views: r.views || "15.2K views",
          badge: r.badge || "Top Selling",
          poster: r.poster?.startsWith("http")
            ? r.poster
            : r.poster?.startsWith("/uploads")
              ? `http://localhost:5000${r.poster}`
              : r.product?.images?.[0] || r.poster,
          altPoster: r.altPoster?.startsWith("http")
            ? r.altPoster
            : r.altPoster?.startsWith("/uploads")
              ? `http://localhost:5000${r.altPoster}`
              : r.product2?.images?.[0] || r.altPoster || "/model04.png",
          video: r.video?.startsWith("http")
            ? r.video
            : r.video?.startsWith("/uploads")
              ? `http://localhost:5000${r.video}`
              : r.video,
        }))
      : REEL_ITEMS;

  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic slides from uploaded admin banners or default slides
  const activeBanners =
    banners && banners.length > 0
      ? banners.filter((b) => !b.position || b.position === "home_hero")
      : [];

  const displaySlides =
    activeBanners.length > 0
      ? activeBanners.map((b) => ({
          bgImage: b.image?.startsWith("http")
            ? b.image
            : b.image?.startsWith("/")
              ? `http://localhost:5000${b.image}`
              : `http://localhost:5000/${b.image}`,
          eyebrow: b.badge || "Featured Collection 2026",
          title1: b.title || "GEAR UP",
          title2: "",
          titleHighlight: "",
          subtitle:
            b.subtitle || "Discover premium fits crafted for everyday impact.",
          accentColor: "#facc15",
          link: b.link || "/products",
          buttonText: b.buttonText || "SHOP NOW",
        }))
      : HERO_SLIDES;

  const activeSlide =
    displaySlides[currentSlide % displaySlides.length] || HERO_SLIDES[0];

  // Auto-slide every 2 seconds (2000ms) as requested: "sliding speed 2 sec kr"
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const heroTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 2000);
    return () => clearInterval(heroTimer);
  }, [displaySlides.length]);

  // Auto-scroll Customer Reviews Rail every 3.2 seconds
  useEffect(() => {
    const reviewsTimer = setInterval(() => {
      const rail = document.getElementById("customer-reviews-rail");
      if (rail) {
        if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 15) {
          rail.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          rail.scrollBy({ left: 360, behavior: "smooth" });
        }
      }
    }, 3200);
    return () => clearInterval(reviewsTimer);
  }, []);

  const scrollCategory = (direction) => {
    if (categoryRailRef.current) {
      const amount = direction === "left" ? -320 : 320;
      categoryRailRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({ limit: 15 }));
    dispatch(fetchCategories());
    dispatch(fetchBanners());
  }, [dispatch]);

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  // Automatic auto-scroll for category slider rail
  useEffect(() => {
    const timer = setInterval(() => {
      if (categoryRailRef.current && !isCategoryHoveredRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          categoryRailRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          categoryRailRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          categoryRailRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const rail = products.slice(0, 4);
  const grid = products.slice(0, 15);

  const allCatList = (categories || []).reduce((acc, cat) => {
    acc.push(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      acc.push(...cat.subcategories);
    }
    return acc;
  }, []);

  const displayCategories = (() => {
    if (allCatList.length === 0) return CATEGORY_ITEMS;

    const backendItems = [...allCatList]
      .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0))
      .map((c, idx) => {
        const catImg = c.image
          ? c.image.startsWith("http") || c.image.startsWith("data:")
            ? c.image
            : c.image.startsWith("/uploads")
              ? `http://localhost:5000${c.image}`
              : c.image
          : CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.image;
        return {
          name: c.name,
          image: catImg,
          fallback:
            CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.fallback ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
          slug: c.slug || c._id,
          cardStyle:
            idx % 2 === 1
              ? "h-[310px] sm:h-[350px] sm:mt-16"
              : "h-[310px] sm:h-[350px] sm:mt-0",
        };
      });

    if (backendItems.length < 5) {
      const existingNames = new Set(backendItems.map((b) => b.name.toLowerCase()));
      const fillItems = CATEGORY_ITEMS.filter((item) => !existingNames.has(item.name.toLowerCase()));
      return [...backendItems, ...fillItems].map((item, idx) => ({
        ...item,
        cardStyle: idx % 2 === 1 ? "h-[310px] sm:h-[350px] sm:mt-16" : "h-[310px] sm:h-[350px] sm:mt-0",
      }));
    }

    return backendItems;
  })();

  useEffect(() => {
    AOS.refresh();
  }, [displayCategories]);

  return (
    <div className="bg-white">
      {/* 1. Hero Banner with 2s auto-slide and compact top/bottom spacing */}
      <section className="relative w-full overflow-hidden bg-neutral-950 h-[560px] sm:h-[620px] lg:h-[670px]">
        {displaySlides.map((slide, sIdx) => {
          const isActive = sIdx === currentSlide % displaySlides.length;
          return (
            <img
              key={slide.bgImage || sIdx}
              src={slide.bgImage}
              alt={slide.title1 || "Hero slide"}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
            />
          );
        })}

        {/* Minimal scrim gradient overlay - bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15 z-10 pointer-events-none" />

        {/* Content container - centered at bottom */}
        <div className="absolute inset-0 flex flex-col justify-end items-center z-20 px-4 sm:px-6 lg:px-12 pb-6 sm:pb-8 text-center">
          <div className="w-full max-w-4xl sm:max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* Eyebrow */}
            <span className="mb-1.5 inline-block text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-[0.25em] text-white/90">
              {activeSlide.eyebrow}
            </span>

            {/* Main Headline (Single row, no second row) */}
            <h1
              className="font-sans font-black tracking-tight text-white uppercase text-center sm:whitespace-nowrap"
              style={{
                fontSize: "clamp(1.5rem, 3.1vw, 2.75rem)",
                lineHeight: "1.08",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 14px rgba(0,0,0,0.6)",
              }}
            >
              {[
                activeSlide.title1,
                activeSlide.title2,
                activeSlide.title3 || activeSlide.titleHighlight,
              ]
                .filter(Boolean)
                .join(" ")}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 sm:mt-2.5 text-xs sm:text-[13.5px] font-medium text-white/90 tracking-wide leading-snug drop-shadow max-w-xl text-center">
              {activeSlide.subtitle}
            </p>

            {/* CTA Action Buttons - Centered */}
            <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to={activeSlide.link || "/products"}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 sm:px-7 sm:py-2.5 text-[11px] font-black tracking-widest text-black uppercase shadow-lg transition hover:bg-neutral-100 hover:scale-102 active:scale-95"
              >
                {activeSlide.buttonText || "SHOP NOW"}
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/30 px-6 py-2 sm:px-7 sm:py-2.5 text-[11px] font-black tracking-widest text-white uppercase transition hover:border-white hover:bg-white/10 hover:scale-102 active:scale-95 backdrop-blur-xs"
              >
                EXPLORE ALL
              </Link>
            </div>

            {/* Slide Indicator Dots - Centered Below Text */}
            <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 bg-black/35 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10 shadow-xs">
              {displaySlides.map((_, sIdx) => {
                const isActive = sIdx === currentSlide % displaySlides.length;
                return (
                  <button
                    key={sIdx}
                    onClick={() => setCurrentSlide(sIdx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "w-7 bg-white shadow-xs"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${sIdx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
        {/* 2. Category Cards Slider Rail */}
        <section className="py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 flex items-center justify-between"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
              Shop By Category
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCategory("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all duration-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:scale-110 active:scale-90"
                  aria-label="Scroll left"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollCategory("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all duration-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:scale-110 active:scale-90"
                  aria-label="Scroll right"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-neutral-500 hover:text-black transition-colors duration-200 hover:underline"
              >
                See all
              </Link>
            </div>
          </motion.div>

          <motion.div
            ref={categoryRailRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={categoryContainerVariants}
            onMouseEnter={() => {
              isCategoryHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isCategoryHoveredRef.current = false;
            }}
            className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
          >
            {displayCategories.map((item) => (
              <motion.div
                key={item.name}
                variants={categoryCardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className={`shrink-0 w-[220px] sm:w-[250px] lg:w-[calc(20%-1rem)] min-w-[210px] snap-start ${item.cardStyle}`}
              >
                <Link
                  to={`/products?category=${item.slug}`}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl bg-neutral-900"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = item.fallback;
                    }}
                  />
                  {/* Scrim gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-95" />

                  {/* Bottom Card Content: Title Left + Arrow Right */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                    <span className="text-sm sm:text-base font-extrabold leading-tight text-white drop-shadow-md pr-2 transition-transform duration-300 group-hover:-translate-y-1">
                      {item.name.split(" ").map((word, wIdx) => (
                        <span key={wIdx} className="block">
                          {word}
                        </span>
                      ))}
                    </span>
                    <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-xs transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-115 group-hover:rotate-[-15deg]">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
        {/* 4. Fresh fits grid (Products Section) */}
        <section className="pb-16 pt-8 sm:pt-12">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl sm:text-4xl leading-tight tracking-wide text-black font-black">
              FRESH FITS FOR{" "}
              <span className="font-script italic font-normal">Your</span>
              <br />
              <span className="font-script italic font-normal">Next</span>{" "}
              OUTFITS
            </h2>
          </motion.div>

          {/* Product Grid - 5 Cards per row (3 rows = 15 cards) with 100% professional WTFlex/BonkersCorner style, zero shadow */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-5">
            {(grid.length ? grid : Array.from({ length: 15 })).map((p, i) => {
              const localImages = [
                "/model01.png",
                "/model04.png",
                "/model03.png",
                "/model02.png",
                "/model05.jpg",
                "/side.png",
                "/model07.jpg",
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
                "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80",
                "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=80",
                "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
              ];

              const sampleNames = [
                "Oversized Acid Wash Tee",
                "Raw Edge Vintage Hoodie",
                "Heavyweight Streetwear Tee",
                "Cyberpunk Graphic Tee",
                "Baggy 90s Skater Cargo",
                "Drop Shoulder Boxy Tee",
                "Signature Mineral Wash Tee",
                "Retro Varsity Bomber",
                "Distressed Parachute Pant",
                "Minimalist Black Cotton Tee",
                "Aesthetic Tokyo Graphic Tee",
                "Relaxed French Terry Shorts",
                "Vintage Fade Streetwear Tee",
                "Reflective Track Pant",
                "Signature Edition Oversized",
              ];

              const productItem = p?._id
                ? {
                    ...p,
                    images:
                      p.images && p.images.length > 0
                        ? p.images
                        : [
                            localImages[i % localImages.length],
                            localImages[(i + 1) % localImages.length],
                          ],
                  }
                : {
                    _id: `sample-${i + 1}`,
                    name: sampleNames[i % sampleNames.length],
                    price: [
                      499, 999, 599, 699, 1299, 549, 649, 1799, 1199, 450, 699,
                      799, 599, 999, 899,
                    ][i % 15],
                    mrp: [
                      999, 1999, 1199, 1399, 2499, 1099, 1299, 3499, 2399, 899,
                      1399, 1599, 1199, 1999, 1799,
                    ][i % 15],
                    discount: 50,
                    brand: "AMA YAAR",
                    category: { name: "OVERSIZED FIT" },
                    images: [
                      localImages[i % localImages.length],
                      localImages[(i + 1) % localImages.length],
                    ],
                  };

              return (
                <motion.div
                  key={productItem._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: (i % 5) * 0.05 }}
                >
                  <ProductCard product={productItem} />
                </motion.div>
              );
            })}
          </div>

          {/* View all button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 text-center"
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-xs font-black tracking-widest text-white uppercase hover:bg-neutral-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs"
            >
              <span>View all products</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>
      </div>

      {/* Our Top Picks Workout Gear Showcase Section */}
      <TopPicksBanner />

      {/* Editorial Streetwear 3D Card Banner */}
      <EditorialBanner />

      {/* 6. Instagram reel cards row — Exactly 5 cards in 1 row on desktop */}
      <section className="w-full bg-[#0a0a0a] py-14 my-10 overflow-hidden">
        {/* Stylish Modern Heading */}
        <div className="mb-10 text-center px-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <InstagramIcon className="h-4 sm:h-5 w-4 sm:w-5 text-[#e11d48]" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.3em] text-[#e11d48]">
              LIVE SHOPPING REELS
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-[0.18em] text-white">
            SHOP FROM YOUR INSTAGRAM FAVORITES
          </h2>
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <div className="h-0.5 w-10 bg-gradient-to-r from-transparent to-[#e11d48]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" />
            <div className="h-0.5 w-10 bg-gradient-to-l from-transparent to-[#e11d48]" />
          </div>
        </div>

        {/* Dynamic 4 or 5 Card Grid Container */}
        <div
          className={`relative mx-auto w-full px-2 sm:px-4 lg:px-6 ${reelsDisplayCount === 5 ? "max-w-[1980px]" : "max-w-[1600px]"}`}
        >
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-1.5 ${reelsDisplayCount === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
          >
            {displayReels.slice(0, reelsDisplayCount).map((item) => (
              <ReelCard
                key={item.id}
                item={item}
                reelsCount={reelsDisplayCount}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
        {/* 7. Customer reviews with AOS Animation & Functional Scroll */}
        <section className="py-16 overflow-hidden">
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black flex items-center flex-wrap">
              <span className="font-display uppercase tracking-tight">
                OUR HAPPY
              </span>
              <span className="font-script italic font-normal ml-3 sm:ml-4">
                Customers
              </span>
            </h2>
            <div className="flex items-center gap-3 text-black">
              <button
                onClick={() => {
                  const rail = document.getElementById("customer-reviews-rail");
                  if (rail) rail.scrollBy({ left: -360, behavior: "smooth" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-90"
                aria-label="Previous review"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const rail = document.getElementById("customer-reviews-rail");
                  if (rail) rail.scrollBy({ left: 360, behavior: "smooth" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-90"
                aria-label="Next review"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            id="customer-reviews-rail"
            className="flex gap-5 overflow-x-auto pt-3 pb-6 px-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {REVIEWS.map((r, idx) => (
              <motion.div
                key={r.name + idx}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
                data-aos-duration="700"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="relative min-w-[340px] max-w-[370px] shrink-0 snap-start rounded-md border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-slate-200/90 stroke-[1.4] rotate-180 shrink-0" />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-black">
                      {r.name}
                    </span>
                    <CheckCircle2 className="h-4 w-4 fill-[#00c853] text-white" />
                  </div>
                </div>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-black/70 font-normal">
                  {r.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* 8. Instagram Banner */}
      <InstagramBanner />

      {/* 9. Newsletter floating card */}
      <section className="bg-white py-10 px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-[1480px] bg-black rounded-2xl p-8 sm:p-10 lg:px-14 lg:py-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          {/* Left: heading */}
          <div className="text-white flex-1">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-wide">
              STAY UPTO DATE{" "}
              <span className="font-script italic font-normal text-white/90">
                About
              </span>
            </h2>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-wide mt-1">
              OUR LATEST{" "}
              <span className="font-script italic font-normal text-white/90">
                Offer
              </span>
            </h2>
          </div>
          {/* Right: email input */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3">
              <svg
                className="h-4 w-4 text-black/40 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 text-xs text-black placeholder-black/40 bg-transparent outline-none font-medium"
              />
            </div>
            <button className="w-full rounded-full bg-white text-black py-3 text-xs font-bold tracking-wide hover:bg-white/90 transition shadow-sm">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
