import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Bell,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { logout, checkAuth } from '../features/auth/authSlice';
import { fetchCart } from '../features/cart/cartSlice';
import { fetchWishlist } from '../features/wishlist/wishlistSlice';
import { fetchCategories } from '../features/products/productsSlice';
import { fetchNotifications, markNotificationRead } from '../features/notifications/notificationsSlice';

const MEGA_MENU_DATA = {
  SHOP: {
    title: 'Explore AMA YAAR Collection',
    columns: [
      {
        heading: 'Topwear',
        items: [
          { name: 'Oversized T-Shirts', to: '/products?category=oversized-printed' },
          { name: 'Acid Wash Fits', to: '/products?category=sleeveless-acid-wash' },
          { name: 'Graphic & Anime Tees', to: '/products?search=graphic' },
          { name: 'Polo & Henley Tees', to: '/products?category=polo-t-shirt' },
          { name: 'Heavyweight (240+ GSM)', to: '/products?search=heavyweight' },
          { name: 'Street Hoodies & Sweats', to: '/products?search=hoodie' },
        ],
      },
      {
        heading: 'Bottomwear & Sets',
        items: [
          { name: '6-Pocket Cargo Pants', to: '/products?search=cargo' },
          { name: 'Baggy Denim Jeans', to: '/products?search=jeans' },
          { name: 'Oversized Street Shorts', to: '/products?search=shorts' },
          { name: 'Parachute & Track Pants', to: '/products?search=trackpants' },
          { name: 'Co-ord Track Sets', to: '/products?search=coord' },
          { name: 'Fleece Loungewear', to: '/products?search=joggers' },
        ],
      },
      {
        heading: 'Curated Drops',
        items: [
          { name: 'New Arrivals 2026', to: '/products?isNewArrival=true' },
          { name: 'Top Rated Best Sellers', to: '/products?isBestSeller=true' },
          { name: 'Under ₹999 Steals', to: '/products?maxPrice=999' },
          { name: 'Drop Shoulder Essentials', to: '/products?search=drop+shoulder' },
          { name: 'Monochrome Black & White', to: '/products?search=black' },
          { name: 'View All Fits', to: '/products' },
        ],
      },
    ],
    promos: [
      {
        title: 'SUMMER DROP 2026',
        subtitle: 'Heavyweight 240 GSM Oversized',
        image: '/cardaut2.png',
        to: '/products?sort=newest',
      },
      {
        title: 'VIRAL ACID WASH',
        subtitle: 'The Signature Vintage Wash Look',
        image: '/model01.png',
        to: '/products?search=acid+wash',
      },
    ],
  },
  MEN: {
    title: "Men's Streetwear Collection",
    columns: [
      {
        heading: 'Men Topwear',
        items: [
          { name: 'Oversized Graphic Tees', to: '/products?search=oversized&category=men' },
          { name: 'Acid Wash Distressed', to: '/products?search=acid+wash' },
          { name: 'Heavyweight Boxy Tees', to: '/products?search=heavyweight' },
          { name: 'Textured Henley & Polos', to: '/products?category=polo-t-shirt' },
          { name: 'Gym & Pump Covers', to: '/products?search=gym' },
          { name: 'Street Jackets & Sweats', to: '/products?search=jacket' },
        ],
      },
      {
        heading: 'Men Bottomwear',
        items: [
          { name: 'Utility Cargo Pants', to: '/products?search=cargo' },
          { name: 'Baggy 90s Skater Jeans', to: '/products?search=jeans' },
          { name: 'Raw Edge Sweat Shorts', to: '/products?search=shorts' },
          { name: 'Heavy Fleece Joggers', to: '/products?search=joggers' },
          { name: 'Relaxed Parachute Pants', to: '/products?search=parachute' },
        ],
      },
      {
        heading: 'Aesthetic Fits',
        items: [
          { name: 'Drop Shoulder Cuts', to: '/products?search=drop+shoulder' },
          { name: 'Cyberpunk & Anime', to: '/products?search=anime' },
          { name: 'Minimalist Clean Fits', to: '/products?search=minimal' },
          { name: 'All Black Everything', to: '/products?search=black' },
          { name: "Explore Men's Shop", to: '/products?category=men' },
        ],
      },
    ],
    promos: [
      {
        title: "MEN'S URBAN FIT DROP",
        subtitle: 'Engineered for Comfort & Raw Style',
        image: '/boys.png',
        to: '/products?category=men',
      },
    ],
  },
  WOMEN: {
    title: "Women's Streetwear Collection",
    columns: [
      {
        heading: 'Women Topwear',
        items: [
          { name: 'Crop Oversized Tees', to: '/products?search=crop' },
          { name: 'Ribbed Baby Tees', to: '/products?search=baby+tee' },
          { name: 'Boyfriend Oversized Fits', to: '/products?search=oversized' },
          { name: 'Cropped Zip Hoodies', to: '/products?search=hoodie' },
          { name: 'Street Chic Corset Tops', to: '/products?search=top' },
          { name: 'Graphic Back-Print Tees', to: '/products?search=graphic' },
        ],
      },
      {
        heading: 'Women Bottomwear',
        items: [
          { name: 'High-Waist Baggy Cargos', to: '/products?search=cargo' },
          { name: 'Wide-Leg Street Jeans', to: '/products?search=jeans' },
          { name: 'Pleated Street Skirts', to: '/products?search=skirt' },
          { name: 'Relaxed Baggy Sweats', to: '/products?search=joggers' },
          { name: 'Biker Shorts & Active', to: '/products?search=shorts' },
        ],
      },
      {
        heading: 'Aesthetic & Vibes',
        items: [
          { name: 'Y2K Retro Aesthetic', to: '/products?search=y2k' },
          { name: 'Pastel Tone Fits', to: '/products?search=pastel' },
          { name: 'Airport Loungewear Sets', to: '/products?search=loungewear' },
          { name: 'College Street Casuals', to: '/products?search=casual' },
          { name: "Explore Women's Shop", to: '/products?category=women' },
        ],
      },
    ],
    promos: [
      {
        title: "WOMEN'S EXCLUSIVE DROP",
        subtitle: 'Effortless Cool & Chic Fits',
        image: '/fashion-model.jpg',
        to: '/products?category=women',
      },
    ],
  },
  TRENDING: {
    title: 'Trending Fits & Most Wanted',
    columns: [
      {
        heading: "What's Viral",
        items: [
          { name: 'Viral Acid Wash Series', to: '/products?search=acid+wash' },
          { name: 'Heavyweight 280 GSM Drop', to: '/products?search=heavyweight' },
          { name: 'Cyber Anime Back-Prints', to: '/products?search=anime' },
          { name: 'Top Rated by 10,000+ Yaars', to: '/products?minRating=4' },
          { name: 'Drop Shoulder Oversized', to: '/products?search=oversized' },
        ],
      },
      {
        heading: 'By Style Vibe',
        items: [
          { name: 'Quiet Luxury Minimalist', to: '/products?search=minimal' },
          { name: 'Vintage 90s Faded Grunge', to: '/products?search=vintage' },
          { name: 'Gym Pump Cover Staples', to: '/products?search=gym' },
          { name: 'Urban Skater Casuals', to: '/products?search=skater' },
          { name: 'Monochrome Streetwear', to: '/products?search=black' },
        ],
      },
      {
        heading: 'Offers & Special Deals',
        items: [
          { name: 'Sign Up - Flat 50% Off', to: '/register' },
          { name: 'Under ₹799 Flash Deals', to: '/products?maxPrice=799' },
          { name: 'Clearance Vault (Up to 60%)', to: '/products?minDiscount=40' },
          { name: 'Free Shipping on All Prepaid', to: '/products' },
          { name: 'Explore All Trending', to: '/products?isTrending=true' },
        ],
      },
    ],
    promos: [
      {
        title: 'VIRAL ON INSTAGRAM',
        subtitle: 'Fits Taking Over Your Daily Feed',
        image: '/cardauto.png',
        to: '/products?isTrending=true',
      },
    ],
  },
  CATEGORIES: {
    title: 'Browse All Categories',
    columns: [
      {
        heading: 'Topwear Categories',
        items: [
          { name: 'Oversized Printed Tees', to: '/products?category=oversized-printed' },
          { name: 'Sleeveless Acid Wash', to: '/products?category=sleeveless-acid-wash' },
          { name: 'Polo T-Shirts', to: '/products?category=polo-t-shirt' },
          { name: 'Henley T-Shirts', to: '/products?category=henley-t-shirt' },
          { name: 'Heavyweight Hoodies', to: '/products?search=hoodie' },
        ],
      },
      {
        heading: 'Bottomwear & Pants',
        items: [
          { name: 'Street Cargos', to: '/products?search=cargo' },
          { name: 'Baggy Jeans', to: '/products?search=jeans' },
          { name: 'Casual Shorts', to: '/products?search=shorts' },
          { name: 'Fleece Joggers', to: '/products?search=joggers' },
          { name: 'Parachute Pants', to: '/products?search=parachute' },
        ],
      },
      {
        heading: 'Specialty Collections',
        items: [
          { name: 'Co-ord Twin Sets', to: '/products?search=coord' },
          { name: 'Gym & Activewear', to: '/products?search=gym' },
          { name: 'Caps & Accessories', to: '/products?search=caps' },
          { name: 'Limited Drops', to: '/products?isNewArrival=true' },
          { name: 'All Categories Index', to: '/products' },
        ],
      },
    ],
    promos: [
      {
        title: 'EXPLORE ALL CATEGORIES',
        subtitle: 'Curated For Ultimate Street Presence',
        image: '/model03.png',
        to: '/products',
      },
    ],
  },
  STORIES: {
    title: 'AMA YAAR Stories & Culture',
    columns: [
      {
        heading: 'Lookbooks & Drops',
        items: [
          { name: 'Lookbook 2026: Style Ka Lafda', to: '/products?sort=newest' },
          { name: 'Acid Wash: From Dye To Fit', to: '/products?search=acid+wash' },
          { name: 'Behind The Scenes: Artwork Drops', to: '/products?search=graphic' },
        ],
      },
      {
        heading: 'Culture & Community',
        items: [
          { name: '#AMAYAARFits: Community Spotlight', to: '/account/orders' },
          { name: 'Why 240+ GSM Heavyweight Cotton?', to: '/products?search=heavyweight' },
          { name: 'Fair Trade & Sustainable Making', to: '/products' },
        ],
      },
      {
        heading: 'Customer Stories',
        items: [
          { name: 'Over 50,000+ Yaars Satisfied', to: '/products?minRating=4' },
          { name: 'Styling Guides & Fit Tips', to: '/products' },
          { name: 'Join The VIP Yaar Club', to: '/register' },
        ],
      },
    ],
    promos: [
      {
        title: 'THE 2026 STREET LOOKBOOK',
        subtitle: 'Bold fits, heavyweight fabrics, unfiltered vibes',
        image: '/cardaut03.png',
        to: '/products',
      },
    ],
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { categories } = useSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotifMenuOpen(false);
    setActiveMegaMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseEnter = (key) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setNotifMenuOpen(false);
    setUserMenuOpen(false);
    setActiveMegaMenu(key);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setActiveMegaMenu(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const leftNavLinks = useMemo(() => {
    const base = [
      { key: 'SHOP', label: 'SHOP', to: '/products' },
      { key: 'CATEGORIES', label: 'CATEGORIES', to: '/products' },
      { key: 'TRENDING', label: 'TRENDING', to: '/products?isTrending=true' },
    ];

    if (categories && categories.length > 0) {
      const rootCats = categories.filter((c) => !c.parent && c.isActive !== false);

      if (rootCats.length > 0) {
        const dynamicCatLinks = rootCats.map((root) => ({
          key: `CAT_${root._id}`,
          label: root.name.toUpperCase(),
          to: `/products?category=${root.slug}`,
        }));

        return [base[0], base[1], ...dynamicCatLinks, base[2]];
      }
    }

    return base;
  }, [categories]);

  const rightNavLinks = [
    { key: 'STORIES', label: 'STORIES', to: '/blog' },
  ];

  const allMenuData = useMemo(() => {
    const categoriesMenu = { ...MEGA_MENU_DATA.CATEGORIES };
    const dynamicMenus = {};

    if (categories && categories.length > 0) {
      const rootCats = categories.filter((c) => !c.parent && c.isActive !== false);
      const subCats = categories.filter((c) => c.parent && c.isActive !== false);

      if (rootCats.length > 0) {
        const catCols = [];
        rootCats.forEach((root) => {
          const children = subCats.filter(
            (sub) => (sub.parent?._id || sub.parent)?.toString() === root._id?.toString()
          );

          if (children.length > 5) {
            const half = Math.ceil(children.length / 2);
            catCols.push({
              heading: root.name,
              items: children.slice(0, half).map((ch) => ({
                name: ch.name,
                to: `/products?category=${ch.slug}`,
              })),
            });
            catCols.push({
              heading: `${root.name} Essentials`,
              items: children.slice(half).map((ch) => ({
                name: ch.name,
                to: `/products?category=${ch.slug}`,
              })),
            });
          } else {
            catCols.push({
              heading: root.name,
              items:
                children.length > 0
                  ? children.map((ch) => ({
                      name: ch.name,
                      to: `/products?category=${ch.slug}`,
                    }))
                  : [{ name: `Explore ${root.name}`, to: `/products?category=${root.slug}` }],
            });
          }
        });
        categoriesMenu.columns = catCols;

        rootCats.forEach((root) => {
          const children = subCats.filter(
            (sub) => (sub.parent?._id || sub.parent)?.toString() === root._id?.toString()
          );

          const columns = [];
          if (children.length > 0) {
            const chunkSize = Math.max(3, Math.ceil(children.length / 3));
            for (let i = 0; i < children.length; i += chunkSize) {
              const chunk = children.slice(i, i + chunkSize);
              const colIdx = Math.floor(i / chunkSize) + 1;
              columns.push({
                heading: colIdx === 1 ? `${root.name} Categories` : `More ${root.name}`,
                items: chunk.map((ch) => ({
                  name: ch.name,
                  to: `/products?category=${ch.slug}`,
                })),
              });
            }
          } else {
            columns.push({
              heading: root.name,
              items: [{ name: `All ${root.name} Fits`, to: `/products?category=${root.slug}` }],
            });
          }

          dynamicMenus[`CAT_${root._id}`] = {
            title: `${root.name} Collection`,
            headingName: root.name,
            slug: root.slug,
            columns,
            promos: [
              {
                title: root.name.toUpperCase(),
                subtitle: `Explore ${root.name} Collection`,
                image: root.image || root.banner || '/fashion-model.jpg',
                to: `/products?category=${root.slug}`,
              },
            ],
          };
        });
      } else {
        categoriesMenu.columns = [
          {
            heading: 'All Categories',
            items: categories.map((cat) => ({
              name: cat.name,
              to: `/products?category=${cat.slug}`,
            })),
          },
        ];
      }
    } else {
      categoriesMenu.columns = [
        {
          heading: 'Categories',
          items: [{ name: 'Explore All Products', to: '/products' }],
        },
      ];
    }

    return {
      ...MEGA_MENU_DATA,
      CATEGORIES: categoriesMenu,
      ...dynamicMenus,
    };
  }, [categories]);

  const currentMenuData = activeMegaMenu ? allMenuData[activeMegaMenu] : null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* Announcement strip */}
      <div className="bg-black px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
        Sign up and get 50% off your first order.{' '}
        <Link to="/register" className="font-bold underline underline-offset-2 hover:text-neutral-200 transition">
          Sign Up Now
        </Link>
      </div>

      {/* Main nav bar */}
      <nav
        className="relative border-b border-black/10 bg-white"
        onMouseLeave={handleMouseLeave}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Left: Mobile toggle + Main Nav Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-black hover:bg-black/5 md:hidden transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden items-center gap-9 md:flex">
              {leftNavLinks.map((l) => {
                const isActive = activeMegaMenu === l.key;
                return (
                  <div
                    key={l.key}
                    onMouseEnter={() => handleMouseEnter(l.key)}
                    className="relative py-2 group cursor-pointer"
                  >
                    <Link
                      to={l.to}
                      className={`relative text-[13px] font-black tracking-wider uppercase transition-all duration-200 ${
                        isActive ? 'text-black font-extrabold' : 'text-black/80 hover:text-black'
                      }`}
                    >
                      {l.label}
                    </Link>
                    {/* Active highlight bar */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full bg-black transition-all duration-200 ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-60'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center: Brand Logo */}
          <Link
            to="/"
            className="flex items-center leading-none group transition-transform duration-200 hover:scale-[1.02]"
          >
            <img src="/logo.png" alt="AMA YAAR" className="h-12 sm:h-14 w-auto object-contain" />
          </Link>

          {/* Right: Secondary Links + Search & Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-9 md:flex">
              {rightNavLinks.map((l) => {
                const isActive = activeMegaMenu === l.key;
                return (
                  <div
                    key={l.key}
                    onMouseEnter={() => handleMouseEnter(l.key)}
                    className="relative py-2 group cursor-pointer"
                  >
                    <Link
                      to={l.to}
                      className={`relative text-[13px] font-black tracking-wider uppercase transition-all duration-200 ${
                        isActive ? 'text-black font-extrabold' : 'text-black/80 hover:text-black'
                      }`}
                    >
                      {l.label}
                    </Link>
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full bg-black transition-all duration-200 ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-60'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="text-black p-1 hover:bg-black/5 rounded-full md:hidden"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden lg:block group">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-neutral-400 transition-colors duration-200 group-focus-within:text-black" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fits..."
                  className="w-40 rounded-full border border-neutral-200 bg-neutral-50/80 py-1.5 pl-9 pr-7 text-xs font-medium text-black placeholder:text-neutral-400 shadow-2xs transition-all duration-200 hover:border-neutral-400 hover:bg-white focus:w-48 focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300/80 text-neutral-700 hover:bg-neutral-400 hover:text-black transition"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => {
                    setActiveMegaMenu(null);
                    setUserMenuOpen(false);
                    setNotifMenuOpen((v) => !v);
                  }}
                  className="relative p-1 text-black hover:opacity-75 transition"
                  title="Notifications"
                >
                  <Bell className="h-[19px] w-[19px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-sm bg-white p-3 shadow-sm border border-neutral-200 z-[60] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <h4 className="text-sm font-bold text-black">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markNotificationRead('all'))}
                          className="text-xs font-semibold text-black/60 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 divide-y divide-black/5 overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-black/40">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => dispatch(markNotificationRead(n._id))}
                            className="cursor-pointer rounded-sm p-2.5 text-xs transition hover:bg-neutral-100 bg-white"
                          >
                            <p className="font-semibold text-black">{n.title}</p>
                            <p className="mt-0.5 text-black/60">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setActiveMegaMenu(null);
                    setNotifMenuOpen(false);
                    setUserMenuOpen((v) => !v);
                  }}
                  className="flex items-center gap-1.5 p-1 text-black hover:opacity-75 transition"
                >
                  <User className="h-[19px] w-[19px]" />
                  <ChevronDown className="hidden h-3 w-3 sm:block text-black/60" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-sm bg-white p-2.5 shadow-sm border border-neutral-200 z-[60] animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="p-3 bg-neutral-50 mb-1.5 rounded-sm">
                      <p className="truncate text-xs font-black text-neutral-900 tracking-tight">{user?.name}</p>
                      <p className="truncate text-[11px] font-medium text-neutral-500 mt-0.5">{user?.email}</p>
                    </div>

                    {/* Menu Items: Only Profile & Sign Out */}
                    <div className="space-y-1">
                      <Link
                        to="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black rounded-sm transition"
                      >
                        <User className="h-4 w-4 text-neutral-600" /> My Profile
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-sm transition"
                      >
                        <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-1 text-black hover:opacity-75 transition"
                title="Sign In"
              >
                <User className="h-[19px] w-[19px]" />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="relative hidden p-1 text-black sm:block hover:opacity-75 transition"
              title="Wishlist"
            >
              <Heart className="h-[19px] w-[19px] transition-transform duration-200 hover:scale-110" strokeWidth={1.8} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white ring-2 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-1 text-black hover:opacity-75 transition"
              title="Cart"
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP MEGA MENU OVERLAY (CLEAN, MINIMALIST & LUXURY)                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {activeMegaMenu && currentMenuData && (
            <motion.div
              key={activeMegaMenu}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
              onMouseLeave={handleMouseLeave}
              className="absolute left-0 right-0 top-full z-50 w-full border-b border-neutral-200/80 bg-white shadow-sm"
            >
              <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                {/* Header title inside dropdown */}
                <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    {currentMenuData.title}
                  </h3>
                  <Link
                    to={
                      currentMenuData?.slug
                        ? `/products?category=${currentMenuData.slug}`
                        : activeMegaMenu === 'MEN'
                        ? '/products?category=men'
                        : activeMegaMenu === 'WOMEN'
                        ? '/products?category=women'
                        : activeMegaMenu === 'TRENDING'
                        ? '/products?isTrending=true'
                        : '/products'
                    }
                    onClick={() => setActiveMegaMenu(null)}
                    className="group inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-500 transition"
                  >
                    View All in {currentMenuData?.headingName || activeMegaMenu}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  {/* Category Columns */}
                  <div className={`grid gap-6 ${currentMenuData.promos?.length === 2 ? 'col-span-7 grid-cols-3' : 'col-span-8 grid-cols-3'}`}>
                    {currentMenuData.columns.map((col, idx) => (
                      <div key={idx} className="space-y-2.5">
                        <h4 className="border-b border-neutral-100 pb-2 text-xs font-black uppercase tracking-wider text-black">
                          {col.heading}
                        </h4>
                        <ul className="space-y-1.5">
                          {col.items.map((item, iIdx) => (
                            <li key={iIdx}>
                              <Link
                                to={item.to}
                                onClick={() => setActiveMegaMenu(null)}
                                className="block py-1 text-xs font-medium text-neutral-600 hover:text-black hover:translate-x-1 transition-transform duration-150"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Promo Showcase Banners */}
                  <div className={`${currentMenuData.promos?.length === 2 ? 'col-span-5 grid grid-cols-2' : 'col-span-4'} gap-4 flex flex-col sm:flex-row`}>
                    {currentMenuData.promos?.map((promo, pIdx) => (
                      <Link
                        key={pIdx}
                        to={promo.to}
                        onClick={() => setActiveMegaMenu(null)}
                        className="group relative flex-1 overflow-hidden rounded-xl bg-neutral-900 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                      >
                        <div className="relative h-56 w-full overflow-hidden">
                          <img
                            src={promo.image}
                            alt={promo.title}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>

                        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                          <h4 className="text-sm font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
                            {promo.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-neutral-300 line-clamp-1">
                            {promo.subtitle}
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:text-white transition">
                            Shop Collection <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>


              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MOBILE MENU (ACCORDION)                                                   */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="border-t border-black/10 bg-white p-4 md:hidden max-h-[80vh] overflow-y-auto">
            {/* Mobile search bar */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search fits, styles, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-9 text-xs font-medium text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-neutral-700 hover:text-black transition"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Nav Accordions */}
            <div className="divide-y divide-neutral-100">
              {Object.keys(allMenuData).map((key) => {
                const isExpanded = mobileExpandedSection === key;
                const menu = allMenuData[key];
                return (
                  <div key={key} className="py-2">
                    <div
                      onClick={() => setMobileExpandedSection(isExpanded ? null : key)}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <span className="text-sm font-black tracking-wider uppercase text-black">
                        {key}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-black transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-2 space-y-4 pl-2 pb-2">
                        {menu.columns.map((col, cIdx) => (
                          <div key={cIdx} className="space-y-1.5">
                            <p className="text-[11px] font-black uppercase text-neutral-400">
                              {col.heading}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {col.items.map((item, iIdx) => (
                                <Link
                                  key={iIdx}
                                  to={item.to}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block py-1.5 text-xs font-medium text-neutral-800 hover:text-black"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}

                        <Link
                          to={
                            key === 'MEN'
                              ? '/products?category=men'
                              : key === 'WOMEN'
                              ? '/products?category=women'
                              : key === 'TRENDING'
                              ? '/products?isTrending=true'
                              : '/products'
                          }
                          onClick={() => setMobileMenuOpen(false)}
                          className="mt-3 block w-full rounded-lg bg-black py-2 text-center text-xs font-bold text-white uppercase tracking-wider"
                        >
                          View All {key} →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Bottom Links */}
            <div className="mt-4 border-t border-neutral-200 pt-4 space-y-2">
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> My Wishlist
                </span>
                {wishlistItems.length > 0 && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  <User className="h-4 w-4" /> My Account ({user?.name})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  <User className="h-4 w-4" /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
