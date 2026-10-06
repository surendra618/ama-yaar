import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/v1/contacts';

export const fetchContactMessages = createAsyncThunk(
  'contactMessages/fetchContactMessages',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(queryParams).toString();
      const url = params ? `${API_URL}?${params}` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch contact messages');
      }
      return data.data?.data || data.data || data; // { messages, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const updateMessageStatus = createAsyncThunk(
  'contactMessages/updateMessageStatus',
  async ({ id, status, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update message status');
      }
      return data.data?.message || data.data || data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const deleteContactMessage = createAsyncThunk(
  'contactMessages/deleteContactMessage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to delete message');
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
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
