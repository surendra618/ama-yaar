import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  Truck,
} from "lucide-react";
import { logout, checkAuth } from "../features/auth/authSlice";
import { fetchCart, openDrawer } from "../features/cart/cartSlice";
import { fetchWishlist } from "../features/wishlist/wishlistSlice";
import { fetchCategories } from "../features/products/productsSlice";
import {
  fetchNotifications,
  markNotificationRead,
} from "../features/notifications/notificationsSlice";
import AuthPopupModal from "./AuthPopupModal";

const MEGA_MENU_DATA = {
  SHOP: {
    title: "Explore AMA YAAR Collection",
    columns: [
      {
        heading: "Topwear",
        items: [
          {
            name: "Oversized T-Shirts",
            to: "/products?category=oversized-printed",
          },
          {
            name: "Acid Wash Fits",
            to: "/products?category=sleeveless-acid-wash",
          },
          { name: "Graphic & Anime Tees", to: "/products?search=graphic" },
          { name: "Polo & Henley Tees", to: "/products?category=polo-t-shirt" },
          {
            name: "Heavyweight (240+ GSM)",
            to: "/products?search=heavyweight",
          },
          { name: "Street Hoodies & Sweats", to: "/products?search=hoodie" },
        ],
      },
      {
        heading: "Bottomwear & Sets",
        items: [
          { name: "6-Pocket Cargo Pants", to: "/products?search=cargo" },
          { name: "Baggy Denim Jeans", to: "/products?search=jeans" },
          { name: "Oversized Street Shorts", to: "/products?search=shorts" },
          {
            name: "Parachute & Track Pants",
            to: "/products?search=trackpants",
          },
          { name: "Co-ord Track Sets", to: "/products?search=coord" },
          { name: "Fleece Loungewear", to: "/products?search=joggers" },
        ],
      },
      {
        heading: "Curated Drops",
        items: [
          { name: "New Arrivals 2026", to: "/products?isNewArrival=true" },
          { name: "Top Rated Best Sellers", to: "/products?isBestSeller=true" },
          { name: "Under ₹999 Steals", to: "/products?maxPrice=999" },
          {
            name: "Drop Shoulder Essentials",
            to: "/products?search=drop+shoulder",
          },
          { name: "Monochrome Black & White", to: "/products?search=black" },
          { name: "View All Fits", to: "/products" },
        ],
      },
    ],
    promos: [
      {
        title: "SUMMER DROP 2026",
        subtitle: "Heavyweight 240 GSM Oversized",
        image: "/cardaut2.png",
        to: "/products?sort=newest",
      },
      {
        title: "VIRAL ACID WASH",
        subtitle: "The Signature Vintage Wash Look",
        image: "/model01.png",
        to: "/products?search=acid+wash",
      },
    ],
  },
  MEN: {
    title: "Men's Streetwear Collection",
    columns: [
      {
        heading: "Men Topwear",
        items: [
          {
            name: "Oversized Graphic Tees",
            to: "/products?search=oversized&category=men",
          },
          { name: "Acid Wash Distressed", to: "/products?search=acid+wash" },
          { name: "Heavyweight Boxy Tees", to: "/products?search=heavyweight" },
          {
            name: "Textured Henley & Polos",
            to: "/products?category=polo-t-shirt",
          },
          { name: "Gym & Pump Covers", to: "/products?search=gym" },
          { name: "Street Jackets & Sweats", to: "/products?search=jacket" },
        ],
      },
      {
        heading: "Men Bottomwear",
        items: [
          { name: "Utility Cargo Pants", to: "/products?search=cargo" },
          { name: "Baggy 90s Skater Jeans", to: "/products?search=jeans" },
          { name: "Raw Edge Sweat Shorts", to: "/products?search=shorts" },
          { name: "Heavy Fleece Joggers", to: "/products?search=joggers" },
          { name: "Relaxed Parachute Pants", to: "/products?search=parachute" },
        ],
      },
      {
        heading: "Aesthetic Fits",
        items: [
          { name: "Drop Shoulder Cuts", to: "/products?search=drop+shoulder" },
          { name: "Cyberpunk & Anime", to: "/products?search=anime" },
          { name: "Minimalist Clean Fits", to: "/products?search=minimal" },
          { name: "All Black Everything", to: "/products?search=black" },
          { name: "Explore Men's Shop", to: "/products?category=men" },
        ],
      },
    ],
    promos: [
      {
        title: "MEN'S URBAN FIT DROP",
        subtitle: "Engineered for Comfort & Raw Style",
        image: "/boys.png",
        to: "/products?category=men",
      },
    ],
  },
  WOMEN: {
    title: "Women's Streetwear Collection",
    columns: [
      {
        heading: "Women Topwear",
        items: [
          { name: "Crop Oversized Tees", to: "/products?search=crop" },
          { name: "Ribbed Baby Tees", to: "/products?search=baby+tee" },
          {
            name: "Boyfriend Oversized Fits",
            to: "/products?search=oversized",
          },
          { name: "Cropped Zip Hoodies", to: "/products?search=hoodie" },
          { name: "Street Chic Corset Tops", to: "/products?search=top" },
          { name: "Graphic Back-Print Tees", to: "/products?search=graphic" },
        ],
      },
      {
        heading: "Women Bottomwear",
        items: [
          { name: "High-Waist Baggy Cargos", to: "/products?search=cargo" },
          { name: "Wide-Leg Street Jeans", to: "/products?search=jeans" },
          { name: "Pleated Street Skirts", to: "/products?search=skirt" },
          { name: "Relaxed Baggy Sweats", to: "/products?search=joggers" },
          { name: "Biker Shorts & Active", to: "/products?search=shorts" },
        ],
      },
      {
        heading: "Aesthetic & Vibes",
        items: [
          { name: "Y2K Retro Aesthetic", to: "/products?search=y2k" },
          { name: "Pastel Tone Fits", to: "/products?search=pastel" },
          {
            name: "Airport Loungewear Sets",
            to: "/products?search=loungewear",
          },
          { name: "College Street Casuals", to: "/products?search=casual" },
          { name: "Explore Women's Shop", to: "/products?category=women" },
        ],
      },
    ],
    promos: [
      {
        title: "WOMEN'S EXCLUSIVE DROP",
        subtitle: "Effortless Cool & Chic Fits",
        image: "/fashion-model.jpg",
        to: "/products?category=women",
      },
    ],
  },
  TRENDING: {
    title: "Trending Fits & Most Wanted",
    columns: [
      {
        heading: "What's Viral",
        items: [
          { name: "Viral Acid Wash Series", to: "/products?search=acid+wash" },
          {
            name: "Heavyweight 280 GSM Drop",
            to: "/products?search=heavyweight",
          },
          { name: "Cyber Anime Back-Prints", to: "/products?search=anime" },
          { name: "Top Rated by 10,000+ Yaars", to: "/products?minRating=4" },
          { name: "Drop Shoulder Oversized", to: "/products?search=oversized" },
        ],
      },
      {
        heading: "By Style Vibe",
        items: [
          { name: "Quiet Luxury Minimalist", to: "/products?search=minimal" },
          { name: "Vintage 90s Faded Grunge", to: "/products?search=vintage" },
          { name: "Gym Pump Cover Staples", to: "/products?search=gym" },
          { name: "Urban Skater Casuals", to: "/products?search=skater" },
          { name: "Monochrome Streetwear", to: "/products?search=black" },
        ],
      },
      {
        heading: "Offers & Special Deals",
        items: [
          { name: "Sign Up - Flat 50% Off", to: "/register" },
          { name: "Under ₹799 Flash Deals", to: "/products?maxPrice=799" },
          {
            name: "Clearance Vault (Up to 60%)",
            to: "/products?minDiscount=40",
          },
          { name: "Free Shipping on All Prepaid", to: "/products" },
          { name: "Explore All Trending", to: "/products?isTrending=true" },
        ],
      },
    ],
    promos: [
      {
        title: "VIRAL ON INSTAGRAM",
        subtitle: "Fits Taking Over Your Daily Feed",
        image: "/cardauto.png",
        to: "/products?isTrending=true",
      },
    ],
  },
  CATEGORIES: {
    title: "Browse All Categories",
    columns: [
      {
        heading: "Topwear Categories",
        items: [
          {
            name: "Oversized Printed Tees",
            to: "/products?category=oversized-printed",
          },
          {
            name: "Sleeveless Acid Wash",
            to: "/products?category=sleeveless-acid-wash",
          },
          { name: "Polo T-Shirts", to: "/products?category=polo-t-shirt" },
          { name: "Henley T-Shirts", to: "/products?category=henley-t-shirt" },
          { name: "Heavyweight Hoodies", to: "/products?search=hoodie" },
        ],
      },
      {
        heading: "Bottomwear & Pants",
        items: [
          { name: "Street Cargos", to: "/products?search=cargo" },
          { name: "Baggy Jeans", to: "/products?search=jeans" },
          { name: "Casual Shorts", to: "/products?search=shorts" },
          { name: "Fleece Joggers", to: "/products?search=joggers" },
          { name: "Parachute Pants", to: "/products?search=parachute" },
        ],
      },
      {
        heading: "Specialty Collections",
        items: [
          { name: "Co-ord Twin Sets", to: "/products?search=coord" },
          { name: "Gym & Activewear", to: "/products?search=gym" },
          { name: "Caps & Accessories", to: "/products?search=caps" },
          { name: "Limited Drops", to: "/products?isNewArrival=true" },
          { name: "All Categories Index", to: "/products" },
        ],
      },
    ],
    promos: [
      {
        title: "EXPLORE ALL CATEGORIES",
        subtitle: "Curated For Ultimate Street Presence",
        image: "/model03.png",
        to: "/products",
      },
    ],
  },
  STORIES: {
    title: "AMA YAAR Stories & Culture",
    columns: [
      {
        heading: "Lookbooks & Drops",
        items: [
          {
            name: "Lookbook 2026: Style Ka Lafda",
            to: "/products?sort=newest",
          },
          {
            name: "Acid Wash: From Dye To Fit",
            to: "/products?search=acid+wash",
          },
          {
            name: "Behind The Scenes: Artwork Drops",
            to: "/products?search=graphic",
          },
        ],
      },
      {
        heading: "Culture & Community",
        items: [
          { name: "#AMAYAARFits: Community Spotlight", to: "/account/orders" },
          {
            name: "Why 240+ GSM Heavyweight Cotton?",
            to: "/products?search=heavyweight",
          },
          { name: "Fair Trade & Sustainable Making", to: "/products" },
        ],
      },
      {
        heading: "Customer Stories",
        items: [
          { name: "Over 50,000+ Yaars Satisfied", to: "/products?minRating=4" },
          { name: "Styling Guides & Fit Tips", to: "/products" },
          { name: "Join The VIP Yaar Club", to: "/register" },
        ],
      },
    ],
    promos: [
      {
        title: "THE 2026 STREET LOOKBOOK",
        subtitle: "Bold fits, heavyweight fabrics, unfiltered vibes",
        image: "/cardaut03.png",
        to: "/products",
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
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );
  const { categories } = useSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !sessionStorage.getItem("auth_popup_shown")) {
      const timer = setTimeout(() => {
        setAuthModalOpen(true);
        sessionStorage.setItem("auth_popup_shown", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

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
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target))
        setNotifMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    navigate("/");
  };

  const leftNavLinks = useMemo(() => {
    const base = [
      { key: "SHOP", label: "SHOP", to: "/products" },
      { key: "CATEGORIES", label: "CATEGORIES", to: "/products" },
      { key: "TRENDING", label: "TRENDING", to: "/products?isTrending=true" },
    ];

    if (categories && categories.length > 0) {
      const rootCats = categories.filter(
        (c) => !c.parent && c.isActive !== false,
      );

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

  const rightNavLinks = [{ key: "STORIES", label: "STORIES", to: "/blog" }];

  const allMenuData = useMemo(() => {
    const categoriesMenu = { ...MEGA_MENU_DATA.CATEGORIES };
    const dynamicMenus = {};

    if (categories && categories.length > 0) {
      const rootCats = categories.filter(
        (c) => !c.parent && c.isActive !== false,
      );
      const subCats = categories.filter(
        (c) => c.parent && c.isActive !== false,
      );

      if (rootCats.length > 0) {
        const catCols = [];
        rootCats.forEach((root) => {
          const children = subCats.filter(
            (sub) =>
              (sub.parent?._id || sub.parent)?.toString() ===
              root._id?.toString(),
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
                  : [
                      {
                        name: `Explore ${root.name}`,
                        to: `/products?category=${root.slug}`,
                      },
                    ],
            });
          }
        });
        categoriesMenu.columns = catCols;

        rootCats.forEach((root) => {
          const children = subCats.filter(
            (sub) =>
              (sub.parent?._id || sub.parent)?.toString() ===
              root._id?.toString(),
          );

          const columns = [];
          if (children.length > 0) {
            const chunkSize = Math.max(3, Math.ceil(children.length / 3));
            for (let i = 0; i < children.length; i += chunkSize) {
              const chunk = children.slice(i, i + chunkSize);
              const colIdx = Math.floor(i / chunkSize) + 1;
              columns.push({
                heading:
                  colIdx === 1
                    ? `${root.name} Categories`
                    : `More ${root.name}`,
                items: chunk.map((ch) => ({
                  name: ch.name,
                  to: `/products?category=${ch.slug}`,
                })),
              });
            }
          } else {
            columns.push({
              heading: root.name,
              items: [
                {
                  name: `All ${root.name} Fits`,
                  to: `/products?category=${root.slug}`,
                },
              ],
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
                image: root.image || root.banner || "/fashion-model.jpg",
                to: `/products?category=${root.slug}`,
              },
            ],
          };
        });
      } else {
        categoriesMenu.columns = [
          {
            heading: "All Categories",
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
          heading: "Categories",
          items: [{ name: "Explore All Products", to: "/products" }],
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

  const isHome = location.pathname === "/";

  return (
    <>
      <header
        className={`z-50 w-full transition-all duration-300 ${
          isHome
            ? isScrolled
              ? "fixed top-0 inset-x-0 bg-neutral-950/80 backdrop-blur-md text-white border-b border-white/10 shadow-sm"
              : "fixed top-0 inset-x-0 bg-transparent border-none text-white"
            : "sticky top-0 bg-neutral-950/85 backdrop-blur-md text-white border-b border-white/10 shadow-xs"
        }`}
      >
        {/* Main Nav Bar with container padding */}
        <nav className="relative">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-12 flex items-center justify-between py-2.5 sm:py-3.5">
            {/* Left: Hamburger menu toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="rounded-full p-2 transition cursor-pointer text-white hover:bg-white/10 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.65)]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                )}
              </button>
            </div>

            {/* Center: Brand Logo - Always the second logo in natural black with full details */}
            <Link
              to="/"
              className="flex items-center leading-none group transition-transform duration-200 hover:scale-[1.02]"
            >
              <img
                src="/logo.png"
                alt="AMA YAAR"
                className="h-9 sm:h-11 w-auto object-contain transition-opacity group-hover:opacity-90 drop-shadow-[0_1px_3px_rgba(255,255,255,0.35)]"
              />
            </Link>

            {/* Right: Search, Notifications, User, Cart */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 transition-colors text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.65)]">
              {/* Search Toggle Button */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-1.5 rounded-full transition cursor-pointer text-white hover:text-white/80 hover:bg-white/10"
                aria-label="Search"
                title="Search fits"
              >
                <Search className="h-5 w-5 stroke-[2]" />
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setNotifMenuOpen((v) => !v);
                    }}
                    className="relative p-1.5 rounded-full transition cursor-pointer text-white hover:text-white/80 hover:bg-white/10"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 stroke-[2]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#e11d48] ring-2 ring-neutral-900" />
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white p-3 shadow-xl border border-neutral-200 z-[60] text-black animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-black/10 pb-2">
                        <h4 className="text-sm font-bold text-black">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={() =>
                              dispatch(markNotificationRead("all"))
                            }
                            className="text-xs font-semibold text-black/60 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 divide-y divide-black/5 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <p className="py-4 text-center text-xs text-black/40">
                            No notifications
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() =>
                                dispatch(markNotificationRead(n._id))
                              }
                              className="cursor-pointer p-2.5 text-xs transition hover:bg-neutral-100 bg-white"
                            >
                              <p className="font-semibold text-black">
                                {n.title}
                              </p>
                              <p className="mt-0.5 text-black/60">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile / Phone OTP Login Popup */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setNotifMenuOpen(false);
                      setUserMenuOpen((v) => !v);
                    }}
                    className="flex items-center gap-1 p-1.5 rounded-full transition cursor-pointer text-white hover:text-white/80 hover:bg-white/10"
                  >
                    <User className="h-5 w-5 stroke-[2]" />
                    <ChevronDown className="hidden h-3 w-3 sm:block text-white/70" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white p-2.5 shadow-xl border border-neutral-200 z-[60] text-black animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 bg-neutral-100 mb-1.5">
                        <p className="truncate text-xs font-black text-neutral-900 tracking-tight">
                          {user?.name}
                        </p>
                        <p className="truncate text-[11px] font-medium text-neutral-500 mt-0.5">
                          {user?.email || user?.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/account/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition"
                        >
                          <User className="h-4 w-4 text-neutral-600" /> My
                          Profile
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition"
                        >
                          <Package className="h-4 w-4 text-neutral-600" /> My Orders
                        </Link>
                        <Link
                          to="/track"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition"
                        >
                          <Truck className="h-4 w-4 text-amber-600" /> Track Order
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="p-1.5 rounded-full transition cursor-pointer text-white hover:text-white/80 hover:bg-white/10"
                  title="Sign In / Sign Up"
                  aria-label="Sign In"
                >
                  <User className="h-5 w-5 stroke-[2]" />
                </button>
              )}

              {/* Shopping Bag / Cart */}
              <button
                type="button"
                onClick={() => dispatch(openDrawer())}
                className="relative p-1.5 rounded-full transition cursor-pointer text-white hover:text-white/80 hover:bg-white/10"
                title="Cart"
              >
                <ShoppingBag className="h-5 w-5 stroke-[2]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black bg-white text-black shadow-xs">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Search Strip */}
          {searchOpen && (
            <div className="px-4 py-3 border-t transition-colors bg-black/75 backdrop-blur-md border-white/10 animate-in fade-in duration-150">
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setSearchOpen(false);
                }}
                className="mx-auto max-w-xl flex items-center gap-2"
              >
                <Search className="h-4 w-4 shrink-0 text-white/60" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fits, collections, products..."
                  className="flex-1 bg-transparent text-sm focus:outline-hidden text-white placeholder:text-neutral-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 transition text-black bg-white hover:bg-neutral-200 cursor-pointer rounded-xs"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </nav>
      </header>

      {/* Slide-over Categories & Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[90] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white sticky top-0 z-20">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src="/logo.png"
                    alt="AMA YAAR"
                    className="h-9 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-800 hover:text-black rounded-full hover:bg-neutral-100 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Search Input */}
              <div className="p-6 pb-2">
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search fits, styles, collections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-9 text-xs font-medium text-black placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </form>
              </div>

              {/* Clean Direct Navigation Links */}
              <div className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-black hover:text-neutral-500 border-b border-neutral-100 transition"
                >
                  SHOP ALL
                </Link>
                <Link
                  to="/products?isNewArrival=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-black hover:text-neutral-500 border-b border-neutral-100 transition"
                >
                  NEW ARRIVALS
                </Link>
                <Link
                  to="/products?isBestSeller=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-black hover:text-neutral-500 border-b border-neutral-100 transition"
                >
                  BEST SELLERS
                </Link>
                <Link
                  to="/products?category=oversized-printed"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-black hover:text-neutral-500 border-b border-neutral-100 transition"
                >
                  OVERSIZED FITS
                </Link>
                <Link
                  to="/products?category=sleeveless-acid-wash"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-black hover:text-neutral-500 border-b border-neutral-100 transition"
                >
                  ACID WASH
                </Link>
                <Link
                  to="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-3 text-xs sm:text-sm font-black tracking-widest uppercase text-amber-700 hover:text-black border-b border-neutral-100 transition"
                >
                  <Truck className="h-4 w-4 text-amber-600" /> TRACK ORDER
                </Link>
              </div>

              {/* Drawer Bottom Auth & Wishlist */}
              <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-2.5">
                <Link
                  to="/account/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-neutral-800 bg-white border border-neutral-200 hover:border-black transition"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> My Wishlist
                  </span>
                  {wishlistItems.length > 0 && (
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-neutral-800 bg-white border border-neutral-200 hover:border-black transition"
                    >
                      <User className="h-4 w-4" /> My Account (
                      {user?.name || user?.phone})
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider text-white bg-black hover:bg-neutral-900 transition cursor-pointer"
                  >
                    <User className="h-4 w-4" /> Sign In / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign In & Sign Up Dummy OTP Modal */}
      <AuthPopupModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
