import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import TopProgressBar from '../components/TopProgressBar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ZeptoCartDrawer from '../features/cart/components/ZeptoCartDrawer';
import ZeptoFloatingCartBar from '../features/cart/components/ZeptoFloatingCartBar';
import api from '../lib/axios';

export default function MainLayout() {
  const location = useLocation();

  // Track creator referral link query parameter (?ref=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref') || params.get('creator');
    if (refCode) {
      const cleanRef = refCode.trim().toUpperCase();
      try {
        localStorage.setItem('ay_creator_ref', cleanRef);
        localStorage.setItem('ay_creator_ref_time', Date.now().toString());
        // Track click asynchronously server-side
        api.post('/creators/track', {
          ref: cleanRef,
          sourceUrl: document.referrer || '',
          targetUrl: window.location.href,
        }).catch(() => {});
      } catch (_) {}
    }
  }, [location]);

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
    AOS.refresh();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopProgressBar />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ZeptoCartDrawer />
      <ZeptoFloatingCartBar />
    </div>
  );
}

