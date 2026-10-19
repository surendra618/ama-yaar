import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchCardSliders = createAsyncThunk('cardSliders/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/card-sliders', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchCardSliderById = createAsyncThunk('cardSliders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/card-sliders/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCardSlider = createAsyncThunk('cardSliders/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/card-sliders', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCardSlider = createAsyncThunk('cardSliders/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/card-sliders/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCardSlider = createAsyncThunk('cardSliders/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/card-sliders/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const cardSlidersSlice = createSlice({
  name: 'cardSliders',
  initialState: { items: [], current: null, status: 'idle', saving: false, error: null },
  reducers: {
    clearCurrentCardSlider: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCardSliders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCardSliders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCardSliders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCardSliderById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteCardSlider.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(createCardSlider.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateCardSlider.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex((item) => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
        }
      })
      .addMatcher(
        (a) => [createCardSlider.pending.type, updateCardSlider.pending.type].includes(a.type),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => [createCardSlider.rejected.type, updateCardSlider.rejected.type].includes(a.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentCardSlider } = cardSlidersSlice.actions;
export default cardSlidersSlice.reducer;
