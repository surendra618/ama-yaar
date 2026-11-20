import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchUsers = createAsyncThunk('users/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchUserById = createAsyncThunk('users/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/status`, { status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createAdminUser = createAsyncThunk(
  'users/createAdmin',
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/admin', { name, email, password, phone });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/role`, { role });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
        if (state.current?._id === action.payload._id) state.current = { ...state.current, ...action.payload };
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.pagination.total = (state.pagination.total || 0) + 1;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
        if (state.current?._id === action.payload._id) state.current = { ...state.current, ...action.payload };
      });
  },
});

export const { clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
