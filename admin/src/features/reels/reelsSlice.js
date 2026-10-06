import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchReels = createAsyncThunk('reels/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/reels/admin');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createReel = createAsyncThunk('reels/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reels', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateReel = createAsyncThunk('reels/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reels/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteReel = createAsyncThunk('reels/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reels/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const reelsSlice = createSlice({
  name: 'reels',
  initialState: { items: [], status: 'idle', saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.reels || [];
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createReel.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateReel.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const idx = state.items.findIndex((item) => item._id === action.payload._id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
      })
      .addCase(deleteReel.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        (a) => [createReel.pending.type, updateReel.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createReel.rejected.type, updateReel.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export default reelsSlice.reducer;
