import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';
import ScrollToTop from '../components/ScrollToTop';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
      <Preloader />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

