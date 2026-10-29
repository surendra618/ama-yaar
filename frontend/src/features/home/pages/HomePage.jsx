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
  ChevronUp,
  ChevronDown,
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
  fetchCardSliders,
} from "../../products/productsSlice";
import api from "../../../lib/axios";
import { getMediaUrl } from "../../../utils/mediaUrl";
import ProductCard from "../../../components/ProductCard";
import InstagramBanner from "../../../components/InstagramBanner";
import EditorialBanner from "../../../components/EditorialBanner";
import WorkoutShowcaseBanner from "../../../components/WorkoutShowcaseBanner";
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
    title: "Oversized Stylish Graphic T-Shirt",
    productName: "Oversized Graphic Tee",
    productId: "oversized-stylish-graphic-t-shirt",
    price: 450,
    mrp: 899,
    discount: "50% OFF",
    views: "18.4K",
    badge: "Top Selling",
    poster: "/model01.png",
    altPoster: "/model04.png",
    video: "/video/video5.mp4",
    altVideo: "/video/video5.mp4",
  },
  {
    id: 2,
    title: "Founder's Vintage Acid Wash Jacket",
    productName: "Founder's Jacket",
    productId: "mens-vintage-acid-wash-fleece-lined-denim-trucker-jacket",
    price: 2999,
    mrp: 3999,
    discount: "25% OFF",
    views: "24.1K",
    badge: "Trending Drop",
    poster: "/boyse.png",
    altPoster: "/model03.png",
    video: "/video/video1.mp4",
    altVideo: "/video/video1.mp4",
    initialExpanded: true,
  },
  {
    id: 3,
    title: "Urban Streetwear Heavyweight Polo",
    productName: "Heavyweight Polo",
    productId: "mens-classic-polo-t-shirt",
    price: 499,
    mrp: 999,
    discount: "50% OFF",
    views: "31.8K",
    badge: "Best Value",
    poster: "/model03.png",
    altPoster: "/model01.png",
    video: "/video/video2.mp4",
    altVideo: "/video/video2.mp4",
  },
  {
    id: 4,
    title: "Original Sleeveless Acid Wash Vest",
    productName: "Acid Wash Vest",
    productId: "sleeveless-acid-wash-gym-vest",
    price: 349,
    mrp: 699,
    discount: "50% OFF",
    views: "12.9K",
    badge: "Limited Drop",
    poster: "/model04.png",
    altPoster: "/model08.jpg",
    video: "/video/video3.mp4",
    altVideo: "/video/video3.mp4",
  },
  {
    id: 5,
    title: "Relaxed Henley Streetwear Tee",
    productName: "Henley Street Tee",
    productId: "relaxed-henley-neck-streetwear-tee",
    price: 420,
    mrp: 840,
    discount: "50% OFF",
    views: "45.3K",
    badge: "Hot Right Now",
    poster: "/model07.jpg",
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

function ReelCard({ item, onOpenModal }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(Boolean(item.initialExpanded));

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

  const handleProductNavigate = (e) => {
    e.stopPropagation();
    if (item.productId) {
      navigate(`/products/${item.productId}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(item)}
      className="group relative flex flex-col cursor-pointer select-none overflow-hidden rounded-2xl bg-neutral-950 shadow-md aspect-[9/15.5] border border-white/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
    >
      {/* Live Video / Poster */}
      {hasError ? (
        <img
          src={item.poster || "/model01.png"}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      ) : (
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
        </video>
      )}

      {/* Subtle Gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Top Left Badge */}
      {item.badge && (
        <span className="absolute left-3 top-3 z-20 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs pointer-events-none">
          {item.badge}
        </span>
      )}

      {/* Floating Bottom Product Drawer / Pill matching Image 3 */}
      <div className="absolute inset-x-0 bottom-3.5 z-30 flex justify-center px-3 pointer-events-auto">
        {isExpanded ? (
          /* Expanded Card matching Image 3 Card 2: [thumbnail] Founder's Jacket ₹2,999 [v] */
          <div
            onClick={handleProductNavigate}
            className="w-full max-w-[250px] rounded-2xl bg-white/90 backdrop-blur-md p-2.5 shadow-2xl border border-white/40 flex items-center justify-between gap-2.5 text-neutral-900 transition-all duration-300 hover:bg-white"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={item.poster || "/model01.png"}
                alt={item.productName || item.title}
                className="h-10 w-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-neutral-900 truncate">
                  {item.productName || item.title}
                </p>
                <p className="text-xs font-bold text-neutral-800">
                  ₹{Number(item.price || 450).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="h-7 w-7 rounded-full bg-neutral-200/80 hover:bg-neutral-300 flex items-center justify-center shrink-0 text-neutral-700 transition"
              title="Collapse"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Collapsed Pill matching Image 3 Cards 1, 3, 4, 5: [img1] [img2] [^] */
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="rounded-full bg-white/85 hover:bg-white backdrop-blur-md px-2.5 py-1.5 flex items-center gap-1.5 shadow-xl border border-white/40 transition-all duration-200 group/pill cursor-pointer"
          >
            <img
              src={item.poster || "/model01.png"}
              alt="Item 1"
              className="h-6 w-6 rounded-full object-cover border border-white shrink-0 shadow-xs"
            />
            {item.altPoster && (
              <img
                src={item.altPoster}
                alt="Item 2"
                className="h-6 w-6 rounded-full object-cover border border-white shrink-0 shadow-xs -ml-2"
              />
            )}
            <ChevronUp className="h-3.5 w-3.5 text-neutral-800 shrink-0 stroke-[2.5] ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

function ReelShoppingModal({ reel, onClose, onNext, onPrev }) {
  const modalVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = isMuted;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [reel, isMuted]);

  if (!reel) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[82vh] max-h-[720px] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl border border-neutral-800 text-white"
      >
        {/* Top Header matching Image 4 */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-black text-xs shadow-md">
              AY
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-wide">
                amayaar.in
              </p>
              <p className="text-[10px] text-white/70 font-medium">
                {reel.views ? `${reel.views} views` : "24.5K views"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              aria-label="Toggle mute"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <video
            ref={modalVideoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={reel.video} type="video/mp4" />
            <source src={reel.altVideo} type="video/mp4" />
          </video>
        </div>

        {/* Navigation Side Controls */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 transition"
            aria-label="Previous reel"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 transition"
            aria-label="Next reel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Bottom Button matching Image 4: [Instagram Icon] Open in Instagram */}
        <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white/90 hover:bg-white px-5 py-2.5 text-xs font-bold text-neutral-900 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <InstagramIcon className="h-4 w-4 text-black" />
            <span>Open in Instagram</span>
          </a>
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
    name: "Ved Singh",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80",
    rating: 5,
    date: "2 days ago",
    text: "Heavyweight graphic tee ka print aur fabric unmatched hai. Wash ke baad bhi color aur shape fade nahi hota. Best streetwear pickup!",
    product: {
      name: "Oversized Stylish Graphic T-shirt",
      image: "/model01.png",
      price: 450,
      variant: "Size: L • Black",
      slug: "oversized-stylish-graphic-t-shirt",
    },
  },
  {
    name: "Kabir Sharma",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80",
    rating: 5,
    date: "4 days ago",
    text: "Minimal streetwear look ke liye ye brand best hai. Comfort level 10/10. Definitely recommendation worthy!",
    product: {
      name: "Men's Vintage Acid Wash Denim Trucker Jacket",
      image: "/boyse.png",
      price: 799,
      variant: "Size: M • Acid Wash",
      slug: "mens-vintage-acid-wash-fleece-lined-denim-trucker-jacket",
    },
  },
  {
    name: "Aditya Gupta",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80",
    rating: 5,
    date: "1 week ago",
    text: "Fabric aur drop shoulder design exact trendy vibe deta hai. Ordering again for my brothers!",
    product: {
      name: "Sleeveless Acid Wash Gym Vest",
      image: "/model04.png",
      price: 349,
      variant: "Size: XL • Charcoal",
      slug: "sleeveless-acid-wash-gym-vest",
    },
  },
  {
    name: "Aarav Mehta",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    rating: 5,
    date: "1 week ago",
    text: "Super impressed with the fitting and material softness. Best online shopping experience so far.",
    product: {
      name: "Relaxed Henley Neck Streetwear Tee",
      image: "/model08.jpg",
      price: 420,
      variant: "Size: M • Raw White",
      slug: "relaxed-henley-neck-streetwear-tee",
    },
  },
  {
    name: "Vansh Singh",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    rating: 5,
    date: "2 weeks ago",
    text: "Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!",
    product: {
      name: "Classic Heavyweight Polo T-Shirt",
      image: "/model03.png",
      price: 499,
      variant: "Size: M • Slate Black",
      slug: "mens-classic-polo-t-shirt",
    },
  },
  {
    name: "Rohan Verma",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80",
    rating: 5,
    date: "2 weeks ago",
    text: "Amaze quality! Zipper polo ki fitting aur stitching bilkul top notch hai. Delivery fast thi aur packaging premium lagti hai.",
    product: {
      name: "Urban Zipper Heavyweight Oversized Polo",
      image: "/side.png",
      price: 549,
      variant: "Size: L • Washed Grey",
      slug: "urban-zipper-heavyweight-oversized-polo",
    },
  },
  {
    name: "Arjun Yadav",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    date: "3 weeks ago",
    text: "Heavyweight drop tee meri favourite purchase rahi! Comfortable, stylish aur perfect fitting. Quality expectations se better nikli.",
    product: {
      name: "Heavyweight Boxy Graphic Streetwear Tee",
      image: "/model05.jpg",
      price: 499,
      variant: "Size: XL • Vintage Black",
      slug: "oversized-stylish-graphic-t-shirt",
    },
  },
  {
    name: "Sunil Kashyap",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    rating: 5,
    date: "1 month ago",
    text: "Oversized t-shirt ka fabric kaafi soft hai aur fitting bhi achhi hai. Pehli baar order kiya tha, but quality expected se better nikli.",
    product: {
      name: "Streetwear Essential Oversized Drop Tee",
      image: "/model07.jpg",
      price: 420,
      variant: "Size: L • Off-Black",
      slug: "oversized-stylish-graphic-t-shirt",
    },
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
  const {
    items: products,
    categories,
    banners,
    cardSliders,
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
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail.trim())) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    setNewsletterLoading(true);
    setNewsletterStatus(null);
    try {
      const res = await api.post('/newsletter/subscribe', { email: newsletterEmail.trim() });
      setNewsletterStatus({ type: 'success', message: res.data?.message || 'Thank you for subscribing!' });
      setNewsletterEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to subscribe. Please try again.';
      setNewsletterStatus({ type: 'error', message: msg });
    } finally {
      setNewsletterLoading(false);
    }
  };

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
      api
        .get("/reels")
        .then((res) => {
          const resData = res.data;
          if (resData && resData.data) {
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
    return () => {
      window.removeEventListener("focus", loadReels);
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
          poster: r.poster ? getMediaUrl(r.poster) : r.product?.images?.[0] || r.poster,
          altPoster: r.altPoster
            ? getMediaUrl(r.altPoster)
            : r.product2?.images?.[0] || r.altPoster || "/model04.png",
          video: r.video ? getMediaUrl(r.video) : r.video,
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
          bgImage: b.image ? getMediaUrl(b.image) : HERO_SLIDES[0].bgImage,
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
    dispatch(fetchCardSliders());
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
          ? getMediaUrl(c.image)
          : CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.image;
        return {
          name: c.name,
          image: catImg,
          fallback:
            CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.fallback ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
          slug: c.slug || c._id,
          link: `/products?category=${c.slug || c._id}`,
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
        link: item.link || `/products?category=${item.slug || ''}`,
        cardStyle: idx % 2 === 1 ? "h-[310px] sm:h-[350px] sm:mt-16" : "h-[310px] sm:h-[350px] sm:mt-0",
      }));
    }

    return backendItems;
  })();

  const displayCardSliders = (cardSliders && cardSliders.length > 0)
    ? cardSliders.map((c, idx) => {
        const cardImg = c.image
          ? getMediaUrl(c.image)
          : CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.image;
        return {
          id: c._id || idx,
          name: c.title || c.name || 'Category',
          subtitle: c.subtitle,
          image: cardImg,
          fallback: CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.fallback || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
          link: c.link || (c.slug ? `/products?category=${c.slug}` : '/products'),
          badge: c.badge,
          cardStyle: idx % 2 === 1 ? 'h-[310px] sm:h-[350px] sm:mt-16' : 'h-[310px] sm:h-[350px] sm:mt-0',
        };
      })
    : displayCategories.map((item, idx) => ({
        ...item,
        id: item._id || item.slug || idx,
        link: item.link || `/products?category=${item.slug || ''}`,
        cardStyle: idx % 2 === 1 ? 'h-[310px] sm:h-[350px] sm:mt-16' : 'h-[310px] sm:h-[350px] sm:mt-0',
      }));

  useEffect(() => {
    AOS.refresh();
  }, [displayCardSliders]);

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
            {displayCardSliders.map((item, idx) => (
              <motion.div
                key={item.id || item.name}
                variants={categoryCardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className={`shrink-0 w-[220px] sm:w-[250px] lg:w-[calc(20%-1rem)] min-w-[210px] snap-start ${item.cardStyle}`}
              >
                <Link
                  to={item.link || '/products'}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl bg-neutral-900"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading={idx < 5 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx < 3 ? "high" : "auto"}
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

        {/* 5-Card Carousel Container matching Image 3 */}
        <div className="relative mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1880px]">
          {/* Side Nav Button Left matching Image 3 */}
          <button
            onClick={() => {
              const rail = document.getElementById("reels-cards-rail");
              if (rail) rail.scrollBy({ left: -340, behavior: "smooth" });
            }}
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-2xl border border-neutral-200 hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Previous reels"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Side Nav Button Right matching Image 3 */}
          <button
            onClick={() => {
              const rail = document.getElementById("reels-cards-rail");
              if (rail) rail.scrollBy({ left: 340, behavior: "smooth" });
            }}
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-2xl border border-neutral-200 hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Next reels"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            id="reels-cards-rail"
            className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] sm:auto-cols-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 pt-1 px-1 scrollbar-hide snap-x snap-mandatory"
          >
            {displayReels.slice(0, 5).map((item, idx) => (
              <ReelCard
                key={item.id}
                item={item}
                onOpenModal={() => setSelectedReelIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Modal matching Image 4 */}
        {selectedReelIndex !== null && displayReels[selectedReelIndex] && (
          <ReelShoppingModal
            reel={displayReels[selectedReelIndex]}
            onClose={() => setSelectedReelIndex(null)}
            onNext={() =>
              setSelectedReelIndex((prev) => (prev + 1) % Math.min(5, displayReels.length))
            }
            onPrev={() =>
              setSelectedReelIndex(
                (prev) => (prev - 1 + Math.min(5, displayReels.length)) % Math.min(5, displayReels.length)
              )
            }
          />
        )}
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
        {/* 7. Customer reviews with AOS Animation & Functional Scroll */}
        <section className="py-16 overflow-hidden">
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            className="mb-8 flex items-end justify-between gap-4"
          >
            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black uppercase tracking-tight text-black font-sans leading-none">
                OUR HAPPY
              </h2>
              <span className="font-script italic text-2xl sm:text-3xl lg:text-[34px] font-normal text-black leading-none self-baseline">
                Customers
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-black shrink-0">
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
            className="flex gap-5 overflow-x-auto pt-3 pb-6 px-1 scrollbar-hide snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {REVIEWS.map((r, idx) => (
              <motion.div
                key={r.name + idx}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                data-aos-duration="600"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="relative flex flex-col justify-between min-w-[340px] max-w-[370px] shrink-0 snap-start rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:border-neutral-400 group"
              >
                <div>
                  {/* Top rating & date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    {r.date && (
                      <span className="text-[11px] font-medium text-neutral-400">
                        {r.date}
                      </span>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="mt-4 flex items-center gap-3">
                    {r.avatar ? (
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover border border-neutral-200 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white font-bold text-xs">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-neutral-900">
                          {r.name}
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-600 text-white shrink-0" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Verified Buyer
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-neutral-600 font-normal">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                {/* Purchased Product Badge */}
                {r.product && (
                  <Link
                    to={r.product.slug ? `/products/${r.product.slug}` : '/products'}
                    className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-2.5 transition-all duration-200 hover:bg-neutral-100 hover:border-black/30 group/prod"
                  >
                    <img
                      src={r.product.image}
                      alt={r.product.name}
                      className="h-12 w-12 rounded-lg object-cover bg-white border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                        Purchased Item
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-neutral-900 truncate group-hover/prod:text-black">
                        {r.product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                        <span className="font-medium text-neutral-600 truncate">{r.product.variant}</span>
                        <span>•</span>
                        <span className="font-extrabold text-black">₹{r.product.price}</span>
                      </div>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-500 group-hover/prod:bg-black group-hover/prod:text-white group-hover/prod:border-black transition-colors">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                )}
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
          {/* Right: email input & form */}
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3 w-full max-w-sm">
            <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-white/40 transition">
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
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus) setNewsletterStatus(null);
                }}
                placeholder="Enter your email address"
                className="flex-1 text-xs text-black placeholder-black/40 bg-transparent outline-none font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={newsletterLoading}
              className="w-full rounded-full bg-white text-black py-3 text-xs font-bold tracking-wide hover:bg-neutral-100 disabled:opacity-75 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {newsletterLoading ? (
                <>
                  <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe to Newsletter</span>
              )}
            </button>

            {newsletterStatus && (
              <div
                className={`text-xs px-3 py-2 rounded-lg text-center font-medium transition animate-in fade-in ${newsletterStatus.type === "success" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-rose-950/80 text-rose-300 border border-rose-500/30"}`}
              >
                {newsletterStatus.message}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}



