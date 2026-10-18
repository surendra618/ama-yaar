import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';
import productDetailsReducer from '../features/productDetails/productDetailsSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import ordersReducer from '../features/orders/ordersSlice';
import accountReducer from '../features/account/accountSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import returnsReducer from '../features/returns/returnsSlice';
import couponsReducer from '../features/coupons/couponsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
    account: accountReducer,
    reviews: reviewsReducer,
    returns: returnsReducer,
    coupons: couponsReducer,
    notifications: notificationsReducer,
  },
});
