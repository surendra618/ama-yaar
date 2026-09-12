import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ArrowLeft, ArrowUpRight, Heart, Play, Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

// lucide-react no longer ships brand marks.
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
import { fetchProducts, fetchCategories, fetchBanners } from '../../products/productsSlice';
import InstagramBanner from '../../../components/InstagramBanner';

const HERO_SLIDES = [
  {
    bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
    eyebrow: 'New Collection 2026',
    title1: 'GEAR UP',
    title2: 'EVERY SEASON',
    titleHighlight: 'Workout',
    subtitle: 'For the ones who move different.',
    accentColor: '#facc15',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85',
    eyebrow: 'Urban Streetwear 2026',
    title1: 'UNLEASH',
    title2: 'URBAN VIBES',
    titleHighlight: 'Streetstyle',
    subtitle: 'Redefining casual luxury & oversized streetwear fits.',
    accentColor: '#38bdf8',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=85',
    eyebrow: 'Premium Essentials',
    title1: 'ELEVATE',
    title2: 'EVERYDAY LOOK',
    titleHighlight: 'Comfort',
    subtitle: '100% Heavyweight Cotton with breathable weave.',
    accentColor: '#f43f5e',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=85',
    eyebrow: 'Limited Drop 2026',
    title1: 'STAND OUT',
    title2: 'IN EVERY CROWD',
    titleHighlight: 'Edgy',
    subtitle: 'Crafted for maximum style impact and everyday versatility.',
    accentColor: '#a855f7',
  },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80',
  'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
];

const CATEGORY_ITEMS = [
  {
    name: 'Oversized Printed',
    image: '/model01.png',
    fallback: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    slug: 'oversized-printed',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-0',
  },
  {
    name: 'Sleeveless Acid wash',
    image: '/model04.png',
    fallback: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80',
    slug: 'sleeveless-acid-wash',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-20',
  },
  {
    name: 'Polo T-Shirt',
    image: '/model03.png',
    fallback: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
    slug: 'polo-t-shirt',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-0',
  },
  {
    name: 'Henley T-Shirt',
    image: '/model02.png',
    fallback: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80',
    slug: 'henley-t-shirt',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-20',
  },
  {
    name: 'Vintage Graphic',
    image: '/model05.jpg',
    fallback: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80',
    slug: 'vintage-graphic',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-0',
  },
  {
    name: 'Acid Wash Denim',
    image: '/boyse.png',
    fallback: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80',
    slug: 'acid-wash-denim',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-20',
  },
  {
    name: 'Urban Zipper Polo',
    image: '/side.png',
    fallback: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    slug: 'urban-zipper-polo',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-0',
  },
  {
    name: 'Streetwear Casual',
    image: '/model07.jpg',
    fallback: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    slug: 'streetwear-casual',
    cardStyle: 'h-[310px] sm:h-[350px] sm:mt-20',
  },
];

const REVIEWS = [
  {
    name: 'Vansh Singh',
    text: 'Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!',
  },
  {
    name: 'Arjun Yadav',
    text: 'Henley T-shirt meri favourite purchase rahi! Comfortable, stylish aur perfect fitting. Quality dekhkar honestly expectations se better laga.',
  },
  {
    name: 'Sunil Kashyap',
    text: 'Oversized t-shirt ka fabric kaafi soft hai aur fitting bhi achhi hai. Pehli baar order kiya tha, but quality expected se better nikli.',
  },
  {
    name: 'Ved Singh',
    text: 'Polo T-shirt ka fabric premium feel deta hai. Office casual ho ya outing, look kaafi classy aur stylish lagta hai. Definitely buying more!',
  },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: products, categories, banners } = useSelector((state) => state.products);
  const categoryRailRef = useRef(null);
  const isCategoryHoveredRef = useRef(false);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Dynamic slides from uploaded admin banners or default slides
  const activeBanners = banners && banners.length > 0
    ? banners.filter((b) => !b.position || b.position === 'home_hero')
    : [];

  const displaySlides = activeBanners.length > 0
    ? activeBanners.map((b) => {
        const fullImg = b.image?.startsWith('http')
          ? b.image
          : b.image?.startsWith('/')
          ? `http://localhost:5000${b.image}`
          : `http://localhost:5000/${b.image}`;
        return {
          bgImage: fullImg,
          eyebrow: b.badge || 'Featured Collection 2026',
          title1: b.title || 'EXCLUSIVE DROP',
          title2: '',
          titleHighlight: '',
          subtitle: b.subtitle || 'Discover premium fits crafted for everyday impact.',
          accentColor: '#facc15',
          link: b.link || '/products',
          buttonText: b.buttonText || 'SHOP NOW',
        };
      })
    : HERO_SLIDES;

  // Auto-rotate Hero Banner every 4.2 seconds
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % displaySlides.length);
    }, 4200);
    return () => clearInterval(heroTimer);
  }, [displaySlides.length]);

  const scrollCategory = (direction) => {
    if (categoryRailRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      categoryRailRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories());
    dispatch(fetchBanners());
  }, [dispatch]);

  // Automatic auto-scroll for category slider rail
  useEffect(() => {
    const timer = setInterval(() => {
      if (categoryRailRef.current && !isCategoryHoveredRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryRailRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          categoryRailRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          categoryRailRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const rail = products.slice(0, 4);
  const grid = products.slice(0, 12);

  const activeSlide = displaySlides[currentHeroSlide % displaySlides.length] || displaySlides[0];

  const allCatList = (categories || []).reduce((acc, cat) => {
    acc.push(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      acc.push(...cat.subcategories);
    }
    return acc;
  }, []);

  const displayCategories = allCatList.length > 0
    ? [...allCatList]
        .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0))
        .map((c, idx) => {
          const catImg = c.image
            ? (c.image.startsWith('http') || c.image.startsWith('data:') ? c.image : c.image.startsWith('/uploads') ? `http://localhost:5000${c.image}` : c.image)
            : CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.image;
          return {
            name: c.name,
            image: catImg,
            fallback: CATEGORY_ITEMS[idx % CATEGORY_ITEMS.length]?.fallback || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
            slug: c.slug || c._id,
            cardStyle: idx % 2 === 1 ? 'h-[310px] sm:h-[350px] sm:mt-16' : 'h-[310px] sm:h-[350px] sm:mt-0',
          };
        })
    : CATEGORY_ITEMS;

  return (
    <div className="bg-white">
      {/* 1. Hero Auto-Rotating Slider */}
      <section className="relative w-full overflow-hidden bg-neutral-950 min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] h-[58vh]">

        {/* Background Images Layer with Smooth Fade */}
        {displaySlides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.bgImage}
            alt={slide.title1}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${idx === (currentHeroSlide % displaySlides.length) ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
          />
        ))}

        {/* Scrim Overlays - Minimal background overlay so image is clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent z-10" />

        {/* Model Cutout Layer with Smooth Crossfade & Scale */}
        {HERO_SLIDES.map((slide, idx) => (
          slide.modelImage && (
            <div
              key={idx}
              className={`absolute right-4 bottom-0 h-[95%] w-[38%] sm:w-[32%] flex items-end justify-end pointer-events-none z-20 transition-all duration-700 ease-out ${idx === currentHeroSlide
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-95'
                }`}
            >
              <img
                src={slide.modelImage}
                alt="Fashion Model"
                className="h-full w-auto object-contain object-bottom"
                style={{ filter: 'drop-shadow(-16px 0 30px rgba(0,0,0,0.6))' }}
              />
            </div>
          )
        ))}

        {/* LEFT Text Content */}
        <div className="absolute inset-0 flex items-center z-20 py-6">
          <div className="mx-auto w-full max-w-7xl px-8 sm:px-12 lg:px-16">
            <div className="max-w-[520px] drop-shadow-md">
              {/* Eyebrow */}
              <span className="mb-2 inline-block text-[12px] font-black uppercase tracking-[0.28em] text-white transition-all duration-500 drop-shadow">
                {activeSlide.eyebrow}
              </span>

              <h1
                className="font-display leading-[0.95] tracking-tight text-white transition-all duration-500 drop-shadow-lg uppercase"
                style={{ fontSize: 'clamp(2.25rem, 4.8vw, 4.2rem)', fontWeight: 900, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
              >
                {activeSlide.title1}
                {activeSlide.title2 && (
                  <>
                    <br />
                    {activeSlide.title2}
                  </>
                )}
                {activeSlide.titleHighlight && (
                  <>
                    <br />
                    EVERY{' '}
                    <span
                      className="font-script italic font-normal transition-colors duration-700 capitalize"
                      style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.6rem)', color: activeSlide.accentColor || '#facc15' }}
                    >
                      {activeSlide.titleHighlight}
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-2.5 text-[13px] sm:text-[14px] font-semibold text-white/90 tracking-wide leading-relaxed drop-shadow">
                {activeSlide.subtitle}
              </p>

              <div className="mt-7 flex items-center gap-3.5 flex-wrap">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[11px] font-black tracking-widest text-black uppercase shadow-lg transition hover:bg-neutral-100 hover:scale-105 active:scale-95"
                >
                  SHOP NOW
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-7 py-3 text-[11px] font-black tracking-widest text-white uppercase transition hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95"
                >
                  EXPLORE ALL
                </Link>
              </div>

              {/* Stats Row */}
              <div className="mt-5 flex items-center gap-7 sm:gap-8">
                {[['500+', 'Products'], ['50K+', 'Happy Customers'], ['Free', 'Shipping']].map(([val, label]) => (
                  <div key={label}>
                    <p className="text-base sm:text-lg font-black text-white leading-none">{val}</p>
                    <p className="mt-1 text-[10px] font-bold text-white/70 uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators & Controls — Minimalist Clean Design (No Big Box) */}
        <div className="absolute bottom-5 right-6 sm:right-12 z-30 flex items-center gap-2">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHeroSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 drop-shadow ${i === (currentHeroSlide % displaySlides.length) ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}

          <div className="flex items-center gap-1 ml-1.5">
            <button
              onClick={() => setCurrentHeroSlide((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition drop-shadow"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % displaySlides.length)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition drop-shadow"
              aria-label="Next slide"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2. Category Cards Slider Rail */}
        <section className="py-12 sm:py-16">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Shop By Category</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCategory('left')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-95"
                  aria-label="Scroll left"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollCategory('right')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-95"
                  aria-label="Scroll right"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <Link to="/products" className="text-xs font-bold text-neutral-500 hover:text-black transition hover:underline">
                See all
              </Link>
            </div>
          </div>

          <div
            ref={categoryRailRef}
            onMouseEnter={() => { isCategoryHoveredRef.current = true; }}
            onMouseLeave={() => { isCategoryHoveredRef.current = false; }}
            className="flex items-start gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
          >
            {displayCategories.map((item) => (
              <Link
                key={item.name}
                to={`/products?category=${item.slug}`}
                className={`group relative block shrink-0 w-[240px] sm:w-[280px] snap-start overflow-hidden rounded-2xl bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${item.cardStyle}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = item.fallback;
                  }}
                />
                {/* Scrim gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Bottom Card Content: Title Left + Arrow Right */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                  <span className="text-sm sm:text-base font-extrabold leading-tight text-white drop-shadow-md pr-2">
                    {item.name.split(' ').map((word, wIdx) => (
                      <span key={wIdx} className="block">{word}</span>
                    ))}
                  </span>
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-xs transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-110">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>





        {/* 4. Fresh fits grid */}
        <section className="pb-16">
          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl leading-tight tracking-wide text-black font-black">
              FRESH FITS FOR <span className="font-script italic font-normal">Your</span>
              <br />
              <span className="font-script italic font-normal">Next</span> OUTFITS
            </h2>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(grid.length ? grid : Array.from({ length: 12 })).map((product, i) => {
              const localImages = [
                '/model01.png',
                '/model04.png',
                '/model03.png',
                '/model02.png',
                '/model05.jpg',
                '/side.png',
                '/model07.jpg',
                'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
                'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
                'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=80',
                'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
              ];
              const rawImg = product?.images?.[0];
              const productImg = rawImg
                ? rawImg.startsWith('http') || rawImg.startsWith('data:')
                  ? rawImg
                  : rawImg.startsWith('/uploads')
                  ? `http://localhost:5000${rawImg}`
                  : rawImg
                : localImages[i % localImages.length];

              return (
                <div key={product?._id || i} className="group relative flex flex-col overflow-hidden rounded-2xl bg-neutral-100 aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300">
                  <Link
                    to={product?._id ? `/products/${product.slug || product._id}` : '/products'}
                    className="relative block h-full w-full overflow-hidden"
                  >
                    <img
                      src={productImg}
                      alt={product?.name || 'Oversized Stylish Men T-shirt'}
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];
                      }}
                    />

                    {/* Top Right Heart Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md transition hover:scale-110 active:scale-95"
                      title="Add to Wishlist"
                    >
                      <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                    </button>

                    {/* Bottom Floating White Pill Box */}
                    <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex items-center justify-between rounded-xl bg-white p-2.5 shadow-lg border border-slate-100/80 transition-transform duration-300 group-hover:scale-[1.02]">
                      <div className="min-w-0 flex-1 pr-1">
                        <p className="truncate text-[11px] font-extrabold text-slate-900 leading-tight">
                          {product?.name || 'Oversized Stylish Men T-shirt'}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 flex-wrap text-[11px]">
                          <span className="font-black text-rose-600">
                            Rs. {(product?.price || 450).toLocaleString('en-IN')}.00
                          </span>
                          <span className="text-[10px] text-slate-400 line-through font-medium">
                            Rs. {(product?.mrp || 899).toLocaleString('en-IN')}.00
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            (50% OFF)
                          </span>
                        </div>
                      </div>

                      {/* Right Chevron / Arrow inside button */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition group-hover:bg-slate-900 group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* View all button */}
          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-xs font-black tracking-widest text-white uppercase hover:bg-black/80 transition"
            >
              View all products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>


        {/* 5. Promo split banners */}
        <section className="grid grid-cols-1 gap-6 pb-16 sm:grid-cols-2">

          {/* Card 1 — Dark / Black */}
          <div className="relative overflow-hidden rounded-3xl bg-[#111]" style={{ minHeight: '520px' }}>

            {/* Right: Model image — LARGE */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end" style={{ width: '72%' }}>
              <img
                src="/model-nirvana.jpg"
                alt="Model"
                className="h-full w-auto object-cover object-top"
                style={{ filter: 'drop-shadow(-12px 0 32px rgba(0,0,0,0.9))' }}
              />
            </div>

            {/* Radial glow behind model */}
            <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.18), transparent 70%)' }} />

            {/* Left: Text content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8" style={{ minHeight: '520px', width: '52%' }}>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[#facc15] text-sm">★★</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#facc15]">Top Selling</span>
                <h3 className="mt-3 font-black leading-[1.05] text-white uppercase" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)' }}>
                  PREMIUM<br />OVERSIZED<br />
                  <span className="text-[#facc15]">T-SHIRT</span>
                </h3>
              </div>

              <ul className="space-y-2 my-5">
                {['100% Cotton', 'Premium Zipper', 'Oversized Fit', 'All Day Comfort', 'Premium Quality'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[11px] font-medium text-white/70">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#facc15]" />
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/35 mb-2">
                  Limited Stock — Order Now!
                </span>
                <button
                  className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition hover:brightness-110 active:scale-95 rounded-full shadow-md"
                  style={{ background: 'linear-gradient(90deg,#facc15,#f59e0b)' }}
                >
                  ORDER NOW
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 — Light / Cream */}
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{ minHeight: '520px', background: 'linear-gradient(135deg,#f5f0e8 0%,#e8e0d0 100%)' }}
          >
            {/* Right: Model image — LARGE */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end" style={{ width: '72%' }}>
              <img
                src="/side09.png"
                alt="Model"
                className="h-full w-auto object-cover object-top"
                style={{ filter: 'drop-shadow(-10px 0 20px rgba(0,0,0,0.12))' }}
              />
            </div>

            {/* Subtle warm glow */}
            <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)' }} />

            {/* Left: Text content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8" style={{ minHeight: '520px', width: '52%' }}>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-amber-700 text-sm">★★</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">Limited Edition</span>
                <h3 className="mt-3 font-black leading-[1.05] text-[#1a1a1a] uppercase" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)' }}>
                  PREMIUM<br />ZIPPER<br />
                  <span className="text-amber-700">SHIRT</span>
                </h3>
              </div>

              <ul className="space-y-2 my-5">
                {['100% Cotton', 'Premium Zipper', 'Comfort Fit', 'All Day Comfort', 'Trending Design'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[11px] font-medium text-black/60">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-black/30 mb-2">
                  Only A Few Made
                </span>
                <button
                  className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition hover:opacity-90 active:scale-95 rounded-full shadow-md bg-[#1a1a1a]"
                >
                  LIMITED EDITION
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>


      {/* 6. Instagram carousel — infinite auto-scroll (Full Width Black Row) */}
      <section className="w-full bg-[#0a0a0a] py-14 my-10 overflow-hidden">
        {/* Premium two-tone heading */}
        <h2 className="mb-10 text-center font-black uppercase px-4">
          <span className="text-lg sm:text-xl tracking-[0.2em] text-white">SHOP FROM </span>
          <span className="text-lg sm:text-xl tracking-[0.2em] text-[#facc15]">YOUR</span>
          <span className="text-lg sm:text-xl tracking-[0.2em] text-white"> INSTAGRAME </span>
          <span className="text-lg sm:text-xl tracking-[0.2em] text-[#facc15]">FAVORITES</span>
        </h2>

        {/* Infinite marquee track — overflow hidden on parent, no padding so cards bleed edge */}
        <div className="overflow-hidden">
          {/* marquee-track duplicates cards: original + clone = seamless loop */}
          <div className="marquee-track flex gap-4 w-max">
            {[...PLACEHOLDER_IMAGES, ...PLACEHOLDER_IMAGES].map((img, i) => (
              <div
                key={i}
                className="w-[155px] sm:w-[175px] shrink-0 cursor-pointer"
              >
                {/* Card image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                  <img
                    src={img}
                    alt="product"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />

                  {/* Top Selling gradient badge */}
                  <span
                    className="absolute left-2 top-2 px-2 py-[3px] text-[9px] font-black uppercase tracking-widest text-white"
                    style={{ background: 'linear-gradient(90deg,#facc15,#f97316)' }}
                  >
                    Top Selling
                  </span>

                  {/* Follower count (every 3rd card) */}
                  {i % 3 === 1 && (
                    <span className="absolute bottom-2 left-2 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                      13.6K views
                    </span>
                  )}

                  {/* Bottom scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Play button — glowing yellow */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#facc15] transition-all duration-200 hover:scale-110 cursor-pointer"
                      style={{
                        background: 'rgba(250,204,21,0.18)',
                        boxShadow: '0 0 18px 4px rgba(250,204,21,0.25)',
                      }}
                    >
                      <Play className="h-5 w-5 fill-[#facc15] text-[#facc15] ml-0.5" />
                    </span>
                  </span>
                </div>

                {/* Product info */}
                <div className="mt-3 px-0.5">
                  <p className="truncate text-[12px] font-semibold text-white/90 leading-snug">
                    Oversized Stylish Men T-shirt
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[13px] font-black text-white">Rs. 450</span>
                    <span className="text-[11px] text-white/35 line-through">Rs. 899</span>
                    <span className="ml-auto text-[10px] font-bold text-green-400">50% OFF</span>
                  </div>
                  <button
                    className="mt-2.5 w-full rounded-md py-2 text-[11px] font-black tracking-widest text-black uppercase transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-95"
                    style={{ background: 'linear-gradient(90deg,#facc15,#fbbf24)' }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pause hint */}
        <p className="mt-4 text-center text-[10px] text-white/30 tracking-widest uppercase">
          Hover to pause
        </p>
      </section>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 7. Customer reviews */}
        <section className="py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black flex items-center flex-wrap">
              <span className="font-display uppercase tracking-tight">OUR HAPPY</span>
              <span className="font-script italic font-normal ml-3 sm:ml-4">Customers</span>
            </h2>
            <div className="flex items-center gap-3 text-black">
              <button className="p-1.5 hover:opacity-60 transition" aria-label="Previous">
                <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
              </button>
              <button className="p-1.5 hover:opacity-60 transition" aria-label="Next">
                <ArrowRight className="h-6 w-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {REVIEWS.map((r) => (
              <div key={r.name} className="min-w-[280px] max-w-[320px] shrink-0 rounded-2xl border border-black/15 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-base font-bold text-black">{r.name}</span>
                  <CheckCircle2 className="h-4 w-4 fill-[#00c853] text-white" />
                </div>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-black/70 font-normal">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 8. Instagram Banner */}
      <InstagramBanner />

      {/* 9. Newsletter floating card */}
      <section className="bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-black rounded-2xl p-8 sm:p-10 lg:px-14 lg:py-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          {/* Left: heading */}
          <div className="text-white flex-1">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-wide">
              STAY UPTO DATE <span className="font-script italic font-normal text-white/90">About</span>
            </h2>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-wide mt-1">
              OUR LATEST <span className="font-script italic font-normal text-white/90">Offer</span>
            </h2>
          </div>
          {/* Right: email input */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3">
              <svg className="h-4 w-4 text-black/40 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
