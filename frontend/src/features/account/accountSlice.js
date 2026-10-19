import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

const getStoredAddresses = () => {
  try {
    return JSON.parse(localStorage.getItem('ay_addresses') || '[]');
  } catch {
    return [];
  }
};

const saveStoredAddresses = (addrs) => {
  try {
    localStorage.setItem('ay_addresses', JSON.stringify(addrs));
  } catch {}
};

export const fetchAddresses = createAsyncThunk(
  'account/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/addresses');
      const apiAddrs = Array.isArray(data.data) ? data.data : [];
      const localAddrs = getStoredAddresses();

      // Merge backend and local addresses (prefer backend ones, include unique local ones)
      const merged = [...apiAddrs];
      localAddrs.forEach((loc) => {
        if (!merged.some((m) => m._id === loc._id || (m.line1 === loc.line1 && m.pincode === loc.pincode))) {
          merged.push(loc);
        }
      });

      saveStoredAddresses(merged);
      return merged;
    } catch (err) {
      // Offline or unauthenticated fallback to local storage
      const local = getStoredAddresses();
      if (local.length > 0) return local;
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'account/addAddress',
  async (addressData, { rejectWithValue, dispatch }) => {
    const tempId = 'addr_' + Date.now();
    const fallbackAddr = {
      ...addressData,
      _id: tempId,
      isDefault: Boolean(addressData.isDefault),
      createdAt: new Date().toISOString(),
    };

    try {
      const { data } = await api.post('/addresses', addressData);
      const saved = data.data || fallbackAddr;
      const current = getStoredAddresses();
      const updated = [
        saved,
        ...current.filter((a) => a._id !== saved._id).map((a) => (saved.isDefault ? { ...a, isDefault: false } : a)),
      ];
      saveStoredAddresses(updated);
      return saved;
    } catch (err) {
      console.warn('Backend addAddress failed, saving to local address book:', err);
      const current = getStoredAddresses();
      const updated = [
        fallbackAddr,
        ...current.filter((a) => a._id !== fallbackAddr._id).map((a) => (fallbackAddr.isDefault ? { ...a, isDefault: false } : a)),
      ];
      saveStoredAddresses(updated);
      return fallbackAddr;
    }
  }
);

export const updateAddress = createAsyncThunk(
  'account/updateAddress',
  async ({ id, data: addressData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/addresses/${id}`, addressData);
      const updatedItem = data.data || { ...addressData, _id: id };
      const current = getStoredAddresses();
      const updated = current.map((a) => (a._id === id ? { ...a, ...updatedItem } : a));
      saveStoredAddresses(updated);
      return updatedItem;
    } catch (err) {
      const current = getStoredAddresses();
      const updated = current.map((a) => (a._id === id ? { ...a, ...addressData } : a));
      saveStoredAddresses(updated);
      return { ...addressData, _id: id };
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'account/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/addresses/${id}/default`);
    } catch (err) {
      console.warn('Backend setDefault failed, updating locally:', err);
    }
    const current = getStoredAddresses();
    const updated = current.map((a) => ({ ...a, isDefault: a._id === id }));
    saveStoredAddresses(updated);
    return id;
  }
);

export const deleteAddress = createAsyncThunk(
  'account/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${id}`);
    } catch (err) {
      console.warn('Backend deleteAddress failed, removing locally:', err);
    }
    const current = getStoredAddresses();
    const updated = current.filter((a) => a._id !== id);
    saveStoredAddresses(updated);
    return id;
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    addresses: getStoredAddresses(),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        if (state.addresses.length === 0) {
          state.addresses = getStoredAddresses();
        }
      })

      // addAddress
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const list = state.addresses.filter((a) => a._id !== action.payload._id);
          if (action.payload.isDefault) {
            state.addresses = [action.payload, ...list.map((a) => ({ ...a, isDefault: false }))];
          } else {
            state.addresses = [action.payload, ...list];
          }
        }
      })

      // updateAddress
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (action.payload) {
          state.addresses = state.addresses.map((a) =>
            a._id === action.payload._id ? { ...a, ...action.payload } : a
          );
        }
      })

      // setDefaultAddress
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a._id === action.payload,
        }));
      })

      // deleteAddress
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      });
  },
});

export default accountSlice.reducer;
