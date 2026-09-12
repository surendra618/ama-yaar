import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import HomePage from '../features/home/pages/HomePage';
import ProductListPage from '../features/products/pages/ProductListPage';
import ProductDetailsPage from '../features/productDetails/pages/ProductDetailsPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import AccountLayout from '../features/account/pages/AccountLayout';
import ProfilePage from '../features/account/pages/ProfilePage';
import AddressesPage from '../features/account/pages/AddressesPage';
import MyOrdersPage from '../features/orders/pages/MyOrdersPage';
import OrderDetailsPage from '../features/orders/pages/OrderDetailsPage';
import WishlistPage from '../features/wishlist/pages/WishlistPage';
import CouponsPage from '../features/coupons/pages/CouponsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import ReturnRequestPage from '../features/returns/pages/ReturnRequestPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductListPage /> },
      { path: '/products/:slug', element: <ProductDetailsPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/orders/:id', element: <OrderDetailsPage /> },
      
      // Redirects for direct navigation or old URLs
      { path: '/orders', element: <Navigate to="/account/orders" replace /> },
      { path: '/wishlist', element: <Navigate to="/account/wishlist" replace /> },
      { path: '/coupons', element: <Navigate to="/account/coupons" replace /> },
      { path: '/notifications', element: <Navigate to="/account/notifications" replace /> },
      { path: '/returns', element: <Navigate to="/account/returns" replace /> },

      {
        path: '/account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Navigate to="/account/profile" replace /> },
          { path: 'profile',       element: <ProfilePage /> },
          { path: 'addresses',     element: <AddressesPage /> },
          { path: 'orders',        element: <MyOrdersPage /> },
          { path: 'wishlist',      element: <WishlistPage /> },
          { path: 'coupons',       element: <CouponsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'returns',       element: <ReturnRequestPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',            element: <LoginPage /> },
      { path: '/register',         element: <RegisterPage /> },
      { path: '/forgot-password',  element: <ForgotPasswordPage /> },
      { path: '/reset-password',   element: <ResetPasswordPage /> },
    ],
  },
]);

