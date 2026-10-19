import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ZeptoCartDrawer from '../features/cart/components/ZeptoCartDrawer';
import ZeptoFloatingCartBar from '../features/cart/components/ZeptoFloatingCartBar';

export default function MainLayout() {
  const location = useLocation();

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

