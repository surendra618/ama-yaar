import { createSlice } from '@reduxjs/toolkit';

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
});

export default reviewsSlice.reducer;
