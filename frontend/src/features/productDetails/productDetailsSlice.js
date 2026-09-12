import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axios';

export const fetchProductDetails = createAsyncThunk(
  'productDetails/fetch',
  async (slugOrId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${slugOrId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'productDetails/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get('/reviews', { params: { product: productId, limit: 20 } }),
        api.get(`/reviews/stats/${productId}`),
      ]);
      return {
        reviews: reviewsRes.data.data.reviews,
        stats: statsRes.data.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitProductReview = createAsyncThunk(
  'productDetails/submitReview',
  async (reviewData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post('/reviews', reviewData);
      dispatch(fetchProductReviews(reviewData.productId));
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState: {
    product: null,
    related: [],
    reviews: [],
    reviewStats: { total: 0, average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    loading: false,
    reviewsLoading: false,
    error: null,
  },
  reducers: {
    clearProductDetails: (state) => {
      state.product = null;
      state.related = [];
      state.reviews = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.related = action.payload.related || [];
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsLoading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews;
        state.reviewStats = action.payload.stats;
      });
  },
});

export const { clearProductDetails } = productDetailsSlice.actions;
export default productDetailsSlice.reducer;
