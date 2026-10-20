import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

const recalcLocalSummary = (state) => {
  const subtotal = state.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const mrpTotal = state.items.reduce((s, i) => s + (i.product?.mrp || i.price || 0) * (i.quantity || 1), 0);
  const isFree = subtotal >= 500;
  const deliveryCharge = state.items.length === 0 || isFree ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax;
  state.itemCount = state.items.reduce((s, i) => s + (i.quantity || 1), 0);
  state.summary = {
    ...state.summary,
    mrpTotal,
    subtotal,
    deliveryCharge,
    freeDeliveryThreshold: 500,
    isFreeDelivery: isFree,
    tax,
    total,
  };
  try {
    localStorage.setItem('ay_guest_cart', JSON.stringify(state.items));
  } catch (_) {}
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth?.isAuthenticated) {
    try {
      // Sync guest cart items to backend cart if any exist
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('ay_guest_cart') || '[]');
      } catch (_) {}

      if (guestItems && guestItems.length > 0) {
        for (const gItem of guestItems) {
          const pid = gItem.productId || gItem.product?._id;
          if (pid) {
            try {
              await api.post('/cart/items', {
                productId: pid,
                quantity: gItem.quantity || 1,
                variant: gItem.variant,
              });
            } catch (syncErr) {
              console.warn('Backend cart sync notice:', syncErr.message);
            }
          }
        }
        try {
          localStorage.removeItem('ay_guest_cart');
        } catch (_) {}
      }

      const { data } = await api.get('/cart');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
  return null;
});

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, product, quantity = 1, variant }, { getState }) => {
    const { auth } = getState();
    if (auth?.isAuthenticated) {
      try {
        const { data } = await api.post('/cart/items', { productId, quantity, variant });
        return data.data;
      } catch (err) {
        console.warn('Backend cart addItem notice, using local state:', err.message);
      }
    }
    return {
      isLocal: true,
      item: {
        productId,
        product,
        quantity,
        variant,
      },
    };
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth?.isAuthenticated && !String(itemId).startsWith('guest_')) {
      try {
        const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
        return data.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
    }
    return { isLocalUpdate: true, itemId, quantity };
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth?.isAuthenticated && !String(itemId).startsWith('guest_')) {
      try {
        const { data } = await api.delete(`/cart/items/${itemId}`);
        return data.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
    }
    return { isLocalRemove: true, itemId };
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

export const clearCart = createAsyncThunk('cart/clear', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  try {
    localStorage.removeItem('ay_guest_cart');
  } catch (_) {}
  if (auth?.isAuthenticated) {
    try {
      const { data } = await api.delete('/cart');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
  return { items: [], itemCount: 0, summary: {} };
});

const getInitialGuestItems = () => {
  try {
    return JSON.parse(localStorage.getItem('ay_guest_cart') || '[]');
  } catch {
    return [];
  }
};

const initialGuestItems = getInitialGuestItems();
const initialSubtotal = initialGuestItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialGuestItems,
    itemCount: initialGuestItems.reduce((s, i) => s + (i.quantity || 1), 0),
    coupon: null,
    summary: {
      mrpTotal: initialGuestItems.reduce((s, i) => s + (i.product?.mrp || i.price || 0) * (i.quantity || 1), 0),
      subtotal: initialSubtotal,
      productDiscount: 0,
      couponDiscount: 0,
      deliveryCharge: initialGuestItems.length === 0 || initialSubtotal >= 500 ? 0 : 49,
      tax: Math.round(initialSubtotal * 0.05),
      total: initialSubtotal + (initialGuestItems.length === 0 || initialSubtotal >= 500 ? 0 : 49) + Math.round(initialSubtotal * 0.05),
    },
    loading: false,
    actionLoading: false,
    error: null,
    couponError: null,
    isDrawerOpen: false,
  },
  reducers: {
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
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
      state.isDrawerOpen = false;
      try {
        localStorage.removeItem('ay_guest_cart');
      } catch (_) {}
    },
    clearCouponError: (state) => {
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    const handleCartData = (state, action) => {
      state.loading = false;
      state.actionLoading = false;

      if (action.payload?.isLocal && action.payload.item) {
        const { product, productId, quantity, variant } = action.payload.item;
        const price = product?.price || 0;
        const existingIdx = state.items.findIndex(
          (i) =>
            (i.product?._id === productId || i.productId === productId) &&
            (!variant?.size || i.variant?.size === variant.size || i.variant === variant.size)
        );
        if (existingIdx > -1) {
          state.items[existingIdx].quantity += Number(quantity);
        } else {
          state.items.push({
            _id: 'guest_' + Date.now(),
            product: product || { _id: productId, price, images: [] },
            productId,
            variant: typeof variant === 'object' ? variant : { size: variant },
            quantity: Number(quantity),
            price,
            itemSubtotal: price * Number(quantity),
          });
        }
        recalcLocalSummary(state);
      } else if (action.payload?.isLocalUpdate) {
        const { itemId, quantity } = action.payload;
        const idx = state.items.findIndex((i) => i._id === itemId);
        if (idx > -1) {
          state.items[idx].quantity = Number(quantity);
          state.items[idx].itemSubtotal = (state.items[idx].price || 0) * Number(quantity);
        }
        recalcLocalSummary(state);
      } else if (action.payload?.isLocalRemove) {
        state.items = state.items.filter((i) => i._id !== action.payload.itemId);
        recalcLocalSummary(state);
      } else if (action.payload) {
        state.items = action.payload.items || [];
        state.itemCount = action.payload.itemCount || 0;
        state.coupon = action.payload.coupon;
        state.summary = action.payload.summary || state.summary;
        state.couponError = null;
      }
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (action.payload) handleCartData(state, action);
        else state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        handleCartData(state, action);
        state.isDrawerOpen = true;
      })
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
      .addCase(clearCart.fulfilled, handleCartData)
      .addCase('orders/create/fulfilled', (state) => {
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
        state.isDrawerOpen = false;
        try {
          localStorage.removeItem('ay_guest_cart');
        } catch (_) {}
      });
  },
});

export const {
  openDrawer,
  closeDrawer,
  toggleDrawer,
  resetCart,
  clearCouponError,
} = cartSlice.actions;
export default cartSlice.reducer;
