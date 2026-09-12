import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchMyReturns = createAsyncThunk(
  'returns/fetchMyReturns',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/returns');
      return data.data.returns || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createReturnRequest = createAsyncThunk(
  'returns/create',
  async (returnData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post('/returns', returnData);
      dispatch(fetchMyReturns());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const returnsSlice = createSlice({
  name: 'returns',
  initialState: {
    returns: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReturns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = action.payload;
      })
      .addCase(fetchMyReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default returnsSlice.reducer;
