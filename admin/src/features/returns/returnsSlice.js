import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchReturns = createAsyncThunk('returns/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/returns', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchReturnById = createAsyncThunk('returns/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/returns/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateReturnStatus = createAsyncThunk(
  'returns/updateStatus',
  async ({ id, status, refundAmount, adminComment }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/returns/${id}/status`, { status, refundAmount, adminComment });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const returnsSlice = createSlice({
  name: 'returns',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    current: null,
    status: 'idle',
    updating: false,
    error: null,
  },
  reducers: {
    clearCurrentReturn: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReturns.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.returns;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(updateReturnStatus.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.current = action.payload;
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateReturnStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentReturn } = returnsSlice.actions;
export default returnsSlice.reducer;
