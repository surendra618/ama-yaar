import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1, variant }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart/items', { productId, quantity, variant });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete('/cart/coupon');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.delete('/cart');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    itemCount: 0,
    coupon: null,
    summary: {
      mrpTotal: 0,
      subtotal: 0,
      productDiscount: 0,
      couponDiscount: 0,
      deliveryCharge: 0,
      tax: 0,
      total: 0,
    },
    loading: false,
    actionLoading: false,
    error: null,
    couponError: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.coupon = null;
      state.summary = {
        mrpTotal: 0,
        subtotal: 0,
        productDiscount: 0,
        couponDiscount: 0,
        deliveryCharge: 0,
        tax: 0,
        total: 0,
      };
    },
    clearCouponError: (state) => {
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    const handleCartData = (state, action) => {
      state.loading = false;
      state.actionLoading = false;
      state.items = action.payload.items || [];
      state.itemCount = action.payload.itemCount || 0;
      state.coupon = action.payload.coupon;
      state.summary = action.payload.summary || state.summary;
      state.couponError = null;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, handleCartData)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToCart.fulfilled, handleCartData)
      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, handleCartData)
      .addCase(removeCartItem.fulfilled, handleCartData)
      .addCase(applyCoupon.pending, (state) => {
        state.actionLoading = true;
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, handleCartData)
      .addCase(applyCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.couponError = action.payload;
      })
      .addCase(removeCoupon.fulfilled, handleCartData)
      .addCase(clearCart.fulfilled, handleCartData);
  },
});

export const { resetCart, clearCouponError } = cartSlice.actions;
export default cartSlice.reducer;
