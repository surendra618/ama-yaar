import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAllReports = createAsyncThunk('reports/fetchAll', async (range, { rejectWithValue }) => {
  try {
    const [sales, revenue, products, users] = await Promise.all([
      api.get('/reports/sales', { params: { range } }),
      api.get('/reports/revenue', { params: { range } }),
      api.get('/reports/products'),
      api.get('/reports/users', { params: { range } }),
    ]);
    return {
      sales: sales.data.data,
      revenue: revenue.data.data,
      products: products.data.data,
      users: users.data.data,
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    sales: null,
    revenue: null,
    products: null,
    users: null,
    range: '30d',
    status: 'idle',
    error: null,
  },
  reducers: {
    setRange: (state, action) => {
      state.range = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReports.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sales = action.payload.sales;
        state.revenue = action.payload.revenue;
        state.products = action.payload.products;
        state.users = action.payload.users;
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setRange } = reportsSlice.actions;
export default reportsSlice.reducer;
