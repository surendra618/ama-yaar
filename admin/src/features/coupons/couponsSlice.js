import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchCoupons = createAsyncThunk('coupons/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/coupons', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCouponById = createAsyncThunk('coupons/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/coupons/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCoupon = createAsyncThunk('coupons/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/coupons', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCoupon = createAsyncThunk('coupons/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/coupons/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCoupon = createAsyncThunk('coupons/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/coupons/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: { items: [], current: null, status: 'idle', saving: false, error: null },
  reducers: {
    clearCurrentCoupon: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex((item) => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
        }
      })
      .addMatcher(
        (a) => [createCoupon.pending.type, updateCoupon.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createCoupon.rejected.type, updateCoupon.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentCoupon } = couponsSlice.actions;
export default couponsSlice.reducer;
