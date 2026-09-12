import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const loginAdmin = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password, role: 'admin' });
    localStorage.setItem('ay_admin_token', data.data.accessToken);
    localStorage.setItem('ay_admin_user', JSON.stringify(data.data.user));
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const checkAdminAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('ay_admin_token');
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    if (data.data.role !== 'admin') return rejectWithValue('Not an admin account');
    return data.data;
  } catch (err) {
    localStorage.removeItem('ay_admin_token');
    localStorage.removeItem('ay_admin_user');
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('ay_admin_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    isAuthenticated: !!localStorage.getItem('ay_admin_token'),
    checked: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ay_admin_token');
      localStorage.removeItem('ay_admin_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.checked = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.checked = true;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
