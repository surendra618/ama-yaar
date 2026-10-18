import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import ZeptoCartDrawer from '../features/cart/components/ZeptoCartDrawer';
import ZeptoFloatingCartBar from '../features/cart/components/ZeptoFloatingCartBar';
import FittingRoomModal from '../features/fittingRoom/components/FittingRoomModal';

export default function MainLayout() {
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
      <FittingRoomModal />
    </div>
  );
}
