import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchBanners = createAsyncThunk('banners/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/banners', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchBannerById = createAsyncThunk('banners/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/banners/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createBanner = createAsyncThunk('banners/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/banners', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateBanner = createAsyncThunk('banners/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/banners/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteBanner = createAsyncThunk('banners/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/banners/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const bannersSlice = createSlice({
  name: 'banners',
  initialState: { items: [], current: null, status: 'idle', saving: false, error: null },
  reducers: {
    clearCurrentBanner: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex((item) => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
        }
      })
      .addMatcher(
        (a) => [createBanner.pending.type, updateBanner.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createBanner.rejected.type, updateBanner.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentBanner } = bannersSlice.actions;
export default bannersSlice.reducer;
