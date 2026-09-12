import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import AdminLoginPage from '../features/auth/pages/AdminLoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UsersListPage from '../features/users/pages/UsersListPage';
import UserDetailsPage from '../features/users/pages/UserDetailsPage';
import ProductsListPage from '../features/products/pages/ProductsListPage';
import ProductFormPage from '../features/products/pages/ProductFormPage';
import CategoriesListPage from '../features/categories/pages/CategoriesListPage';
import CategoryFormPage from '../features/categories/pages/CategoryFormPage';
import OrdersListPage from '../features/orders/pages/OrdersListPage';
import OrderDetailsPage from '../features/orders/pages/OrderDetailsPage';
import CouponsListPage from '../features/coupons/pages/CouponsListPage';
import CouponFormPage from '../features/coupons/pages/CouponFormPage';
import BannersListPage from '../features/banners/pages/BannersListPage';
import BannerFormPage from '../features/banners/pages/BannerFormPage';
import PaymentsListPage from '../features/payments/pages/PaymentsListPage';
import ReturnsListPage from '../features/returns/pages/ReturnsListPage';
import ReturnDetailsPage from '../features/returns/pages/ReturnDetailsPage';
import ReportsPage from '../features/reports/pages/ReportsPage';

export const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/users', element: <UsersListPage /> },
      { path: '/users/:id', element: <UserDetailsPage /> },
      { path: '/products', element: <ProductsListPage /> },
      { path: '/products/new', element: <ProductFormPage /> },
      { path: '/products/:id/edit', element: <ProductFormPage /> },
      { path: '/categories', element: <CategoriesListPage /> },
      { path: '/categories/new', element: <CategoryFormPage /> },
      { path: '/categories/:id/edit', element: <CategoryFormPage /> },
      { path: '/orders', element: <OrdersListPage /> },
      { path: '/orders/:id', element: <OrderDetailsPage /> },
      { path: '/coupons', element: <CouponsListPage /> },
      { path: '/coupons/new', element: <CouponFormPage /> },
      { path: '/coupons/:id/edit', element: <CouponFormPage /> },
      { path: '/banners', element: <BannersListPage /> },
      { path: '/banners/new', element: <BannerFormPage /> },
      { path: '/banners/:id/edit', element: <BannerFormPage /> },
      { path: '/payments', element: <PaymentsListPage /> },
      { path: '/returns', element: <ReturnsListPage /> },
      { path: '/returns/:id', element: <ReturnDetailsPage /> },
      { path: '/reports', element: <ReportsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <AdminLoginPage /> }],
  },
]);
