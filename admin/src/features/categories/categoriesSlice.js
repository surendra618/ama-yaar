import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchCategories = createAsyncThunk('categories/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/categories', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCategoryById = createAsyncThunk('categories/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCategory = createAsyncThunk('categories/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/categories', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/categories/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    current: null,
    status: 'idle',
    saving: false,
    error: null,
  },
  reducers: {
    clearCurrentCategory: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex((item) => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
        }
      })
      .addMatcher(
        (a) => [createCategory.pending.type, updateCategory.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createCategory.fulfilled.type, updateCategory.fulfilled.type].includes(a.type),
        (state) => {
          state.saving = false;
        }
      )
      .addMatcher(
        (a) => [createCategory.rejected.type, updateCategory.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
