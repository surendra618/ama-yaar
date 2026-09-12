import { createSlice } from '@reduxjs/toolkit';

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    selectedAddress: null,
    paymentMethod: 'COD',
    paymentProvider: 'cod',
    step: 1, // 1: Address, 2: Payment, 3: Review & Place
  },
  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload.method;
      state.paymentProvider = action.payload.provider;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    resetCheckout: (state) => {
      state.selectedAddress = null;
      state.paymentMethod = 'COD';
      state.paymentProvider = 'cod';
      state.step = 1;
    },
  },
});

export const { setSelectedAddress, setPaymentMethod, setStep, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
