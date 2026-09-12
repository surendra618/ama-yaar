import { Link } from 'react-router-dom';

// lucide-react no longer ships brand/social marks — small inline glyphs instead.
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.54.5a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2 2c1.64.5 8.54.5 8.54.5s6.9 0 8.54-.5a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12ZM9.8 15.5v-7l6 3.5-6 3.5Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#f0f0f0] text-black border-t border-black/10">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Info Column */}
          <div className="md:col-span-5 lg:col-span-5">
            <Link to="/" className="inline-block leading-none group">
              <img
                src="/logo.png"
                alt="AMA YAAR"
                className="h-16 sm:h-20 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </Link>

            <p className="mt-5 max-w-md text-xs sm:text-sm leading-relaxed text-black/60">
              At AMAYAAR, style is more than just what you wear — it's how you express yourself. Our clothing and
              footwear are designed to match your individuality and confidence. Style ka lafda? AMAYAAR has you covered.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition hover:scale-105"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-sm transition hover:scale-105"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-sm transition hover:scale-105"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Spacing / Column items */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 lg:col-span-7 md:pl-6">
            {/* HELP */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-4">HELP</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-black/60">
                <li>
                  <Link to="/account/orders" className="hover:text-black transition">
                    Track your order
                  </Link>
                </li>
                <li>
                  <Link to="/account/profile" className="hover:text-black transition">
                    Customer support
                  </Link>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-black transition">Privacy Policy</span>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-black transition">Terms &amp; Conditions</span>
                </li>
              </ul>
            </div>

            {/* FAQ */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-4">FAQ</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-black/60">
                <li>
                  <Link to="/account/profile" className="hover:text-black transition">
                    Account
                  </Link>
                </li>
                <li>
                  <Link to="/account/orders" className="hover:text-black transition">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-black transition">
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-4">COMPANY</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-black/60">
                <li>
                  <span className="cursor-pointer hover:text-black transition">About us</span>
                </li>
                <li>
                  <span className="cursor-pointer hover:text-black transition">Contact us</span>
                </li>
                <li>
                  <a
                    href="http://localhost:5174"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-black transition"
                  >
                    Admin Portal &rarr;
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-black/10 pt-6 text-xs text-black/50 sm:flex-row">
          <p>© {new Date().getFullYear()} AMAYAAR. All rights reserved.</p>
          <p className="text-xs text-black/50 font-medium">Style Ka Lafda</p>
        </div>
      </div>
    </footer>
  );
}
