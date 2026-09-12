import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchActiveCoupons = createAsyncThunk(
  'coupons/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/coupons', { params: { activeOnly: 'true' } });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchActiveCoupons.fulfilled, (state, action) => {
      state.coupons = action.payload || [];
    });
  },
});

export default couponsSlice.reducer;
