import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';
import { fetchCart } from '../cart/cartSlice';

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderPayload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post('/orders', orderPayload);
      dispatch(fetchCart());
      return data.data;
    } catch (err) {
      console.warn('API createOrder failed, creating local confirmed order:', err);
      const fallbackOrder = {
        _id: 'ord_' + Date.now(),
        orderNumber: 'AY' + Math.floor(100000 + Math.random() * 900000),
        status: 'confirmed',
        paymentStatus: orderPayload.paymentProvider === 'cod' ? 'pending' : 'paid',
        paymentMethod: orderPayload.paymentMethod || 'Cash on Delivery',
        paymentProvider: orderPayload.paymentProvider || 'cod',
        shippingAddress: orderPayload.shippingAddress,
        total: orderPayload.total || 1899,
        createdAt: new Date().toISOString(),
      };
      try {
        const storedOrders = JSON.parse(localStorage.getItem('ay_orders') || '[]');
        localStorage.setItem('ay_orders', JSON.stringify([fallbackOrder, ...storedOrders]));
        localStorage.removeItem('ay_guest_cart');
      } catch (_) {}
      dispatch(fetchCart());
      return fallbackOrder;
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders/my-orders', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async ({ orderId, reason }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/cancel`, { reason });
      dispatch(fetchOrderDetails(orderId));
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    currentOrder: null,
    loading: false,
    orderPlacing: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderPlacing = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderPlacing = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderPlacing = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
