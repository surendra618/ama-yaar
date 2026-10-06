import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchEditorialLooks = createAsyncThunk('editorialLooks/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/editorial-looks/admin');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createEditorialLook = createAsyncThunk('editorialLooks/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/editorial-looks', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateEditorialLook = createAsyncThunk('editorialLooks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/editorial-looks/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteEditorialLook = createAsyncThunk('editorialLooks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/editorial-looks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const editorialLooksSlice = createSlice({
  name: 'editorialLooks',
  initialState: { items: [], status: 'idle', saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEditorialLooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEditorialLooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : action.payload?.looks || [];
      })
      .addCase(fetchEditorialLooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createEditorialLook.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateEditorialLook.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const idx = state.items.findIndex((item) => item._id === action.payload._id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
      })
      .addCase(deleteEditorialLook.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        (a) => [createEditorialLook.pending.type, updateEditorialLook.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createEditorialLook.rejected.type, updateEditorialLook.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export default editorialLooksSlice.reducer;
