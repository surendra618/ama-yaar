import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchContactMessages = createAsyncThunk(
  'contactMessages/fetchContactMessages',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/contacts', { params: queryParams });
      return response.data?.data?.data || response.data?.data || response.data; // { messages, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

export const updateMessageStatus = createAsyncThunk(
  'contactMessages/updateMessageStatus',
  async ({ id, status, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/contacts/${id}/status`, { status, adminNotes });
      return response.data?.data?.message || response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

export const deleteContactMessage = createAsyncThunk(
  'contactMessages/deleteContactMessage',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/contacts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

const contactMessagesSlice = createSlice({
  name: 'contactMessages',
  initialState: {
    messages: [],
    total: 0,
    loading: false,
    error: null,
    statusFilter: 'all',
    searchQuery: '',
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const updatedMsg = action.payload;
        const index = state.messages.findIndex((m) => m._id === updatedMsg._id);
        if (index !== -1) {
          state.messages[index] = updatedMsg;
        }
      })
      .addCase(deleteContactMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((m) => m._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { setStatusFilter, setSearchQuery } = contactMessagesSlice.actions;
export default contactMessagesSlice.reducer;
