import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchBlogs = createAsyncThunk('blogs/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/blogs/admin/all');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createBlog = createAsyncThunk('blogs/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/blogs', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateBlog = createAsyncThunk('blogs/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/blogs/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteBlog = createAsyncThunk('blogs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/blogs/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: { items: [], status: 'idle', saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload && action.payload._id) {
          const idx = state.items.findIndex((item) => item._id === action.payload._id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default blogsSlice.reducer;
