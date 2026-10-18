import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wornItems: [],
  basePieces: ['hat', 'inner', 'pants', 'shoes'],
  isOpen: false,
  isDressing: false,
  selectedModel: 'male-1',
  userUploadedPhoto: null,
  flyingGarment: null, // { image, startRect: { top, left, width, height }, key }
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
    removeBasePiece: (state, action) => {
      const pieceId = action.payload;
      state.basePieces = state.basePieces.filter((p) => p !== pieceId);
    },
    clearFittingRoom: (state) => {
      state.wornItems = [];
      state.basePieces = ['hat', 'inner', 'pants', 'shoes'];
    },
    resetFittingRoom: (state) => {
      state.wornItems = [];
      state.basePieces = ['hat', 'inner', 'pants', 'shoes'];
      state.isDressing = false;
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
    setFlyingGarment: (state, action) => {
      state.flyingGarment = action.payload;
    },
    clearFlyingGarment: (state) => {
      state.flyingGarment = null;
    },
  },
});

export const {
  toggleWearItem,
  wearItem,
  removeWornItem,
  removeBasePiece,
  clearFittingRoom,
  resetFittingRoom,
  openFittingRoom,
  closeFittingRoom,
  toggleFittingRoom,
  setDressing,
  setSelectedModel,
  setUserUploadedPhoto,
  setFlyingGarment,
  clearFlyingGarment,
} = fittingRoomSlice.actions;

export default fittingRoomSlice.reducer;
