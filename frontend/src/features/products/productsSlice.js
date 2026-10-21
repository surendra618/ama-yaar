import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (params = { activeOnly: 'true' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/categories', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchFilterOptions = createAsyncThunk(
  'products/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/filters');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchBanners = createAsyncThunk(
  'products/fetchBanners',
  async (params = { activeOnly: 'true' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/banners', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCardSliders = createAsyncThunk(
  'products/fetchCardSliders',
  async (params = { activeOnly: 'true' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/card-sliders', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const loadCache = (key, fallback) => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveCache = (key, val) => {
  try {
    if (typeof window !== 'undefined' && val) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch {}
};

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: loadCache('ay_cached_products', []),
    pagination: { page: 1, limit: 12, total: 0, pages: 1 },
    categories: loadCache('ay_cached_categories', []),
    filterOptions: { brands: [], minPrice: 0, maxPrice: 50000, categories: [] },
    banners: loadCache('ay_cached_banners', []),
    cardSliders: loadCache('ay_cached_card_sliders', []),
    loading: false,
    categoriesLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        // If we already have cached items, don't flash a full screen spinner
        if (!state.items || state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
        saveCache('ay_cached_products', action.payload.products);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        if (!state.categories || state.categories.length === 0) {
          state.categoriesLoading = true;
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        saveCache('ay_cached_categories', action.payload);
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.filterOptions = action.payload;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
        saveCache('ay_cached_banners', action.payload);
      })
      .addCase(fetchCardSliders.fulfilled, (state, action) => {
        state.cardSliders = action.payload;
        saveCache('ay_cached_card_sliders', action.payload);
      });
  },
});

export default productsSlice.reducer;
