import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import usersReducer from '../features/users/usersSlice';
import productsReducer from '../features/products/productsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import ordersReducer from '../features/orders/ordersSlice';
import couponsReducer from '../features/coupons/couponsSlice';
import bannersReducer from '../features/banners/bannersSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import returnsReducer from '../features/returns/returnsSlice';
import reportsReducer from '../features/reports/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    coupons: couponsReducer,
    banners: bannersReducer,
    payments: paymentsReducer,
    returns: returnsReducer,
    reports: reportsReducer,
  },
});
