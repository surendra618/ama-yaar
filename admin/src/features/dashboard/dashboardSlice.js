import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/dashboard');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    kpis: null,
    orderStatusMap: {},
    chartData: [],
    recentOrders: [],
    topProducts: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kpis = action.payload.kpis;
        state.orderStatusMap = action.payload.orderStatusMap;
        state.chartData = action.payload.chartData;
        state.recentOrders = action.payload.recentOrders;
        state.topProducts = action.payload.topProducts;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
