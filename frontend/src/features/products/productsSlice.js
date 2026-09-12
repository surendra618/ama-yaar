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

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 12, total: 0, pages: 1 },
    categories: [],
    filterOptions: { brands: [], minPrice: 0, maxPrice: 50000, categories: [] },
    banners: [],
    loading: false,
    categoriesLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.filterOptions = action.payload;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
      });
  },
});

export default productsSlice.reducer;
