import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';
import { fetchCart } from '../cart/cartSlice';

const loadLocalWishlist = () => {
  try {
    const stored = localStorage.getItem('ay_wishlist_items');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (items) => {
  try {
    localStorage.setItem('ay_wishlist_items', JSON.stringify(items || []));
  } catch {}
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist');
    const products = data?.data?.products || [];
    saveLocalWishlist(products);
    return products;
  } catch (err) {
    // If backend fails or token is renewing, fallback to saved local wishlist items
    const local = loadLocalWishlist();
    if (local && local.length > 0) {
      return local;
    }
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      const products = data?.data?.wishlist?.products || [];
      saveLocalWishlist(products);
      return products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const moveWishlistItemToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post(`/wishlist/move-to-cart/${productId}`);
      dispatch(fetchWishlist());
      dispatch(fetchCart());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadLocalWishlist(),
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      try {
        localStorage.removeItem('ay_wishlist_items');
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase('auth/logout', (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
        try {
          localStorage.removeItem('ay_wishlist_items');
        } catch {}
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
