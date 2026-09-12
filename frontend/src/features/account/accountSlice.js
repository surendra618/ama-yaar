import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchAddresses = createAsyncThunk(
  'account/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/addresses');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'account/addAddress',
  async (addressData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post('/addresses', addressData);
      dispatch(fetchAddresses());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'account/updateAddress',
  async ({ id, data: addressData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.put(`/addresses/${id}`, addressData);
      dispatch(fetchAddresses());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'account/setDefaultAddress',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.patch(`/addresses/${id}/default`);
      dispatch(fetchAddresses());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'account/deleteAddress',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.delete(`/addresses/${id}`);
      dispatch(fetchAddresses());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSlice.reducer;
