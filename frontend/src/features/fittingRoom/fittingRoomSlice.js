import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wornItems: [],
  isOpen: false,
  isDressing: false,
  selectedModel: 'male-1',
  userUploadedPhoto: null,
};

const fittingRoomSlice = createSlice({
  name: 'fittingRoom',
  initialState,
  reducers: {
    toggleWearItem: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const pid = product._id || product.id || product.slug;
      const exists = state.wornItems.some(
        (it) => (it._id || it.id || it.slug) === pid
      );

      if (exists) {
        state.wornItems = state.wornItems.filter(
          (it) => (it._id || it.id || it.slug) !== pid
        );
      } else {
        state.wornItems.push(product);
        state.isDressing = true;
        state.isOpen = true;
      }
    },
    wearItem: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const pid = product._id || product.id || product.slug;
      const exists = state.wornItems.some(
        (it) => (it._id || it.id || it.slug) === pid
      );
      if (!exists) {
        state.wornItems.push(product);
      }
      state.isDressing = true;
      state.isOpen = true;
    },
    removeWornItem: (state, action) => {
      const pid = action.payload;
      state.wornItems = state.wornItems.filter(
        (it) => (it._id || it.id || it.slug) !== pid
      );
    },
    clearFittingRoom: (state) => {
      state.wornItems = [];
    },
    openFittingRoom: (state) => {
      state.isOpen = true;
    },
    closeFittingRoom: (state) => {
      state.isOpen = false;
    },
    toggleFittingRoom: (state) => {
      state.isOpen = !state.isOpen;
    },
    setDressing: (state, action) => {
      state.isDressing = action.payload;
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
      state.isDressing = true;
    },
    setUserUploadedPhoto: (state, action) => {
      state.userUploadedPhoto = action.payload;
      state.selectedModel = 'user';
      state.isDressing = true;
    },
  },
});

export const {
  toggleWearItem,
  wearItem,
  removeWornItem,
  clearFittingRoom,
  openFittingRoom,
  closeFittingRoom,
  toggleFittingRoom,
  setDressing,
  setSelectedModel,
  setUserUploadedPhoto,
} = fittingRoomSlice.actions;

export default fittingRoomSlice.reducer;
