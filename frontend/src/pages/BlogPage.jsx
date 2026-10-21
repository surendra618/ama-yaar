import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  User,
  Tag,
  Search,
  Sparkles,
  Eye,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Maximize2,
  Sliders,
  Palette,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = ['All Stories', 'Style Guide', 'Vibe & Trends', 'Streetwear Essentials', 'Culture Lab'];

const FEATURED_EDITORIAL_IMAGES = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85',
  '/model-nirvana.jpg',
  '/fashion-model.jpg',
  '/sectionbanner.png',
  '/sectionbanner2.png',
];

const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: 'The Rise of Heavyweight 240+ GSM Oversized Tees in 2026 Street Culture',
    category: 'Style Guide',
    author: 'Vansh Singh',
    role: 'Head of Design',
    date: 'Oct 02, 2026',
    readTime: '4 min read',
    views: '14.8K',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85',
    featured: true,
    excerpt: 'Why standard thin cotton tees are dead. How 240+ GSM boxy cut streetwear tees maintain shape, drape, and long-lasting urban presence. Crafted from 100% combed heavyweight cotton with a ribbed high-density neck collar and preshrunk bio-wash finish, engineered for raw street presence and all-day relaxed comfort.',
  },
  {
    id: 2,
    title: 'Acid Wash vs Vintage Fade: How to Style Distressed Denim & Graphic Tops',
    category: 'Vibe & Trends',
    author: 'Arjun Yadav',
    role: 'Creative Director',
    date: 'Sep 28, 2026',
    readTime: '5 min read',
    views: '9.3K',
    image: '/model01.png',
    featured: false,
    excerpt: 'Demystifying handcrafted acid wash techniques. Here is how to pair distressed washed tops with 6-pocket cargos for effortless cool.',
  },
  {
    id: 3,
    title: '6-Pocket Cargo Pants: The Ultimate Guide to Street Comfort & Utility',
    category: 'Streetwear Essentials',
    author: 'Sunil Kashyap',
    role: 'Lead Stylist',
    date: 'Sep 21, 2026',
    readTime: '3 min read',
    views: '12.1K',
    image: '/cardauto.png',
    featured: false,
    excerpt: 'From skater roots to modern airport lookbooks: why utility cargo pants are the most versatile bottomwear investment you can make.',
  },
  {
    id: 4,
    title: 'Behind the Art: How Our Cyber Anime Back-Prints Are Designed',
    category: 'Culture Lab',
    author: 'Rohan Verma',
    role: 'Art Director',
    date: 'Sep 14, 2026',
    readTime: '6 min read',
    views: '8.7K',
    image: '/cardaut03.png',
    featured: false,
    excerpt: 'Take an exclusive peek into our design lab as we sketch, digitize, and screen-print bold anime artwork on drop shoulder silhouettes.',
  },
  {
    id: 5,
    title: 'Minimalist Layering: How to Rock Oversized Hoodies & Overshirts in Autumn',
    category: 'Style Guide',
    author: 'Aarav Mehta',
    role: 'Fashion Editor',
    date: 'Sep 05, 2026',
    readTime: '4 min read',
    views: '11.5K',
    image: '/model04.png',
    featured: false,
    excerpt: 'Layering without looking bulky. Essential rules for combining French Terry hoodies, boxy tees, and structured jackets.',
  },
  {
    id: 6,
    title: 'The Streetwear Color Palette: Mastering Earth Tones, Washed Greys & Neons',
    category: 'Vibe & Trends',
    author: 'Kabir Sharma',
    role: 'Color Chemist',
    date: 'Aug 29, 2026',
    readTime: '4 min read',
    views: '7.4K',
    image: '/model03.png',
    featured: false,
    excerpt: 'From washed sage and faded mocha to high-contrast neon accents — how color choice defines your daily street identity.',
  }
];

export default function BlogPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState(DEFAULT_ARTICLES);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % FEATURED_EDITORIAL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api
      .get('/blogs')
      .then((res) => {
        const liveBlogs = res.data?.data?.blogs;
        if (Array.isArray(liveBlogs) && liveBlogs.length > 0) {
          const formatted = liveBlogs.map((b, idx) => ({
            id: b._id || b.id || idx,
            title: b.title,
            category: b.category || 'Style Guide',
            author: b.author || 'AMA YAAR Team',
            role: b.role || 'Fashion Editor',
            date: b.date || 'Oct 2026',
            readTime: b.readTime || '4 min read',
            views: b.views || '10.2K',
            image: b.image || '/model-nirvana.jpg',
            featured: Boolean(b.featured),
            excerpt: b.excerpt || '',
          }));
          setArticles(formatted);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch blogs from API, using default articles', err);
      });
  }, []);

  const featuredArticle = articles.find(a => a.featured) || articles[0];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All Stories' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleArticleClick = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 select-none font-sans">
      {/* 1. Top Header Banner */}
      <section className="bg-black py-14 sm:py-20 text-white text-center border-b border-neutral-800">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#e11d48]">
            <BookOpen className="h-4 w-4" /> AMA YAAR JOURNAL &amp; LOOKBOOKS
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white leading-none">
            STREETWEAR <span className="text-[#e11d48]">STORIES &amp; CULTURE</span>
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-medium uppercase tracking-wider leading-relaxed">
            Style guides, fabric technology, drop shoulder fits, and deep dives into Indian urban fashion culture.
          </p>
        </div>
      </section>

      {/* 2. Sticky Category Chips & Search Bar */}
      <section className="border-b border-neutral-200 bg-neutral-50 sticky top-[64px] z-30 shadow-xs">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition whitespace-nowrap rounded-none border ${isActive
                    ? 'bg-black text-white border-black font-black'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-black hover:text-black'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories & fits..."
              className="w-full bg-white border border-neutral-200 rounded-none pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition font-medium"
            />
          </div>

        </div>
      </section>

      {/* 3. Featured Hero Main Article - Magazine Editorial Presentation */}
      {selectedCategory === 'All Stories' && !searchQuery && featuredArticle && (
        <section className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleArticleClick}
            className="group cursor-pointer bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 grid grid-cols-1 lg:grid-cols-12 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-between space-y-6 bg-white">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider">
                  <span className="bg-[#e11d48] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    ★ FEATURED STORY
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-black">
                    <Tag className="h-3.5 w-3.5 text-[#e11d48]" />
                    {featuredArticle.category}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-neutral-500">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    {featuredArticle.readTime}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-neutral-500">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    {featuredArticle.views} views
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic text-black tracking-tight leading-tight group-hover:text-[#e11d48] transition-colors duration-200">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                  {featuredArticle.excerpt}
                </p>

                {/* Key Story Takeaways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-100">
                  <div className="flex items-start gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-2.5 border border-neutral-200/80">
                    <span className="font-black text-white bg-black px-1.5 py-0.5 text-[10px] shrink-0">01</span>
                    <p className="font-medium"><strong className="text-black font-extrabold">Zero Translucency:</strong> 240+ GSM holds structured boxy shape all day.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-2.5 border border-neutral-200/80">
                    <span className="font-black text-white bg-black px-1.5 py-0.5 text-[10px] shrink-0">02</span>
                    <p className="font-medium"><strong className="text-black font-extrabold">Drop Shoulder:</strong> Extra room around torso for signature street drape.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-2.5 border border-neutral-200/80">
                    <span className="font-black text-white bg-black px-1.5 py-0.5 text-[10px] shrink-0">03</span>
                    <p className="font-medium"><strong className="text-black font-extrabold">Bio-Wash Finish:</strong> Ribbed collar firmness preserved after 50+ washes.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-2.5 border border-neutral-200/80">
                    <span className="font-black text-white bg-black px-1.5 py-0.5 text-[10px] shrink-0">04</span>
                    <p className="font-medium"><strong className="text-black font-extrabold">100% Combed:</strong> All-day breathable weave designed for Indian comfort.</p>
                  </div>
                </div>

                {/* Designer Quote Box */}
                <div className="p-3.5 bg-neutral-50 border-l-4 border-black text-xs text-neutral-800 italic font-medium">
                  "Our 240+ GSM oversized tees were custom engineered to bridge the gap between heavy skater utility and effortless everyday casual luxury."
                </div>
              </div>

              {/* Author Row */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-black">{featuredArticle.author}</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{featuredArticle.role}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-black bg-black text-white px-5 py-2.5 uppercase tracking-wider group-hover:bg-[#e11d48] transition duration-200 shadow-xs">
                  EXPLORE DROP <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>

            {/* Right Image Column (5 cols) - Magazine Full Cover Presentation */}
            <div className="lg:col-span-5 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[520px] bg-neutral-950 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImgIndex}
                  src={FEATURED_EDITORIAL_IMAGES[activeImgIndex] || featuredArticle.image}
                  alt={featuredArticle.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85';
                  }}
                />
              </AnimatePresence>

              {/* Editorial Gradient & Floating Pill */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 inset-x-5 z-20 flex items-center justify-between text-white">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">LOOKBOOK EDITION</span>
                  <span className="text-xs font-black uppercase tracking-wider text-white">AUTUMN / WINTER 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {FEATURED_EDITORIAL_IMAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${activeImgIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* 4. Articles Grid Section */}
      <section className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 italic">
            LATEST JOURNAL ARTICLES <span className="text-neutral-400 text-sm font-normal">({filteredArticles.length})</span>
          </h2>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-slate-200 rounded-none">
            <BookOpen className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
            <p className="text-base font-black text-neutral-900 uppercase tracking-wider">No Stories Found</p>
            <p className="text-xs text-neutral-500 mt-1">Try changing your search term or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={handleArticleClick}
                className="bg-white border border-neutral-200 overflow-hidden flex flex-col group cursor-pointer hover:border-neutral-400 transition duration-300 rounded-none shadow-xs"
              >
                {/* Image Box */}
                <div className="h-52 sm:h-56 bg-neutral-100 overflow-hidden relative border-b border-neutral-200">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500 ease-out"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-black/90 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider border border-neutral-700 rounded-none">
                    {article.category}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-bold uppercase tracking-wider mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {article.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#e11d48] transition leading-snug uppercase tracking-wide">
                      {article.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed font-medium line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500">{article.author}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-black uppercase tracking-wider group-hover:translate-x-1 transition group-hover:text-[#e11d48]">
                      SHOP FITS <ArrowRight className="h-3.5 w-3.5 text-[#e11d48]" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Streetwear Fabric & Craftsmanship Lab Specs */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 border-t border-b border-black relative overflow-hidden">
        {/* Background Subtle Accent Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
              STREETWEAR ANATOMY &amp; SPECIFICATIONS
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
              Every garment is engineered from heavy-gauge 240+ GSM combed Terry cotton with boxy drop-shoulder geometry, preshrunk bio-wash processing, and high-density screen graphics built for timeless urban durability.
            </p>
          </div>

          {/* 4 Craftsmanship Spec Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-700 transition duration-300 group rounded-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black tracking-widest text-[#e11d48] uppercase">
                    01 / FABRIC DENSITY
                  </span>
                  <ShieldCheck className="h-5 w-5 text-[#e11d48] group-hover:scale-110 transition duration-300" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white transition">
                  240+ GSM Heavy Cotton
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-medium">
                  Crafted with 100% combed cotton. Ultra-rigid weave prevents translucency and holds its structured drop silhouette all day long.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>TEST RATING</span>
                <span className="text-[#e11d48]">240+ GSM</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-700 transition duration-300 group rounded-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black tracking-widest text-[#e11d48] uppercase">
                    02 / SILHOUETTE
                  </span>
                  <Maximize2 className="h-5 w-5 text-[#e11d48] group-hover:scale-110 transition duration-300" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white transition">
                  Boxy Drop Shoulder
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-medium">
                  Extended sleeve length with an exaggerated dropped shoulder seam engineered to create a relaxed silhouette without feeling baggy.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>FIT PROFILE</span>
                <span className="text-[#e11d48]">100% RELAXED</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-700 transition duration-300 group rounded-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black tracking-widest text-[#e11d48] uppercase">
                    03 / PRESHRUNK BIO-WASH
                  </span>
                  <Zap className="h-5 w-5 text-[#e11d48] group-hover:scale-110 transition duration-300" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white transition">
                  Zero Shrinkage Guarantee
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-medium">
                  Enzymatic pre-wash treatment strips unwanted fuzz and pre-shrinks fibers, ensuring zero deformation wash after wash.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>SHRINK TOLERANCE</span>
                <span className="text-[#e11d48]">0.0% ZERO</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-6 flex flex-col justify-between hover:border-neutral-700 transition duration-300 group rounded-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black tracking-widest text-[#e11d48] uppercase">
                    04 / HIGH-DENSITY PRINT
                  </span>
                  <Palette className="h-5 w-5 text-[#e11d48] group-hover:scale-110 transition duration-300" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white transition">
                  Crack-Resistant Pigments
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-medium">
                  Cured plastisol and water-based pigments fused into cotton grain. No peeling, cracking, or color bleeding over lifetime wear.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>DURABILITY</span>
                <span className="text-[#e11d48]">50+ WASHES</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-14 pt-10 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#e11d48] uppercase italic block">240+ GSM</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">Cotton Terry</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#e11d48] uppercase italic block">100%</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">Combed Organic</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#e11d48] uppercase italic block">0.0%</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">Post-Wash Shrinkage</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#e11d48] uppercase italic block">50+</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">Machine Wash Tested</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trending Lookbook Banners Grid */}
      <section className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 py-14 sm:py-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 italic flex items-center gap-2">
            <Layers className="h-5 w-5 text-black" />
            SPOTLIGHT LOOKBOOKS &amp; DROPS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/products?sort=newest')}
            className="group cursor-pointer relative h-64 sm:h-72 overflow-hidden bg-black text-white p-6 flex flex-col justify-end border border-neutral-800"
          >
            <img
              src="/cardaut2.png"
              alt="Summer Drop 2026"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <span className="bg-[#e11d48] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                NEW DROP
              </span>
              <h3 className="text-xl font-black uppercase italic text-white group-hover:text-[#e11d48] transition">
                SUMMER HEAVYWEIGHT DROP
              </h3>
              <p className="text-xs text-neutral-300 mt-1 font-medium">240 GSM preshrunk oversized fits built for raw daily presence.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/products?search=acid+wash')}
            className="group cursor-pointer relative h-64 sm:h-72 overflow-hidden bg-black text-white p-6 flex flex-col justify-end border border-neutral-800"
          >
            <img
              src="/model01.png"
              alt="Viral Acid Wash"
              className="absolute inset-0 h-full w-full object-cover object-top opacity-70 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <span className="bg-white text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                HANDCRAFTED
              </span>
              <h3 className="text-xl font-black uppercase italic text-white group-hover:text-[#e11d48] transition">
                VIRAL ACID WASH SERIES
              </h3>
              <p className="text-xs text-neutral-300 mt-1 font-medium">Distressed vintage washed tops paired with utility 6-pocket cargos.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/products?search=anime')}
            className="group cursor-pointer relative h-64 sm:h-72 overflow-hidden bg-black text-white p-6 flex flex-col justify-end border border-neutral-800"
          >
            <img
              src="/cardaut03.png"
              alt="Cyber Anime Artwork"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <span className="bg-[#e11d48] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                ART LAB
              </span>
              <h3 className="text-xl font-black uppercase italic text-white group-hover:text-[#e11d48] transition">
                CYBER ANIME BACK-PRINTS
              </h3>
              <p className="text-xs text-neutral-300 mt-1 font-medium">Original screen-printed back artwork on heavy boxy silhouettes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter VIP Access Section */}
      <section className="bg-black py-16 sm:py-20 text-white text-center border-t border-neutral-800">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12">
          <span className="inline-flex items-center justify-center h-12 w-12 bg-neutral-900 text-[#e11d48] border border-neutral-800 rounded-md mb-4">
            <Flame className="h-6 w-6" />
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tight">STAY AHEAD OF THE DROPS</h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-medium max-w-md mx-auto leading-relaxed">
            Subscribe to our journal newsletter for exclusive lookbooks, fabric breakdowns, early drop access, and flat 50% discount codes.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to AMA YAAR Journal! Check your email for drop codes.');
            }}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 border border-neutral-700 bg-neutral-900 px-6 py-3.5 text-xs text-white placeholder:text-neutral-500 focus:border-[#e11d48] focus:outline-none rounded-none font-medium shadow-xs"
            />
            <button
              type="submit"
              className="bg-[#e11d48] px-8 py-3.5 text-xs font-black text-white hover:bg-[#be123c] transition uppercase tracking-widest rounded-none border border-[#e11d48] shadow-xs"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
