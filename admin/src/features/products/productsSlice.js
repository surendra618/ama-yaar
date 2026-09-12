import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCategoriesForSelect = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/categories');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    categories: [],
    current: null,
    status: 'idle',
    saving: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategoriesForSelect.fulfilled, (state, action) => {
        state.categories = action.payload.categories || action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex((item) => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
        }
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.saving = false;
      })
      .addMatcher(
        (action) => [createProduct.pending.type, updateProduct.pending.type].includes(action.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [createProduct.rejected.type, updateProduct.rejected.type].includes(action.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
