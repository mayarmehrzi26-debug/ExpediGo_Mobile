// slice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedAddress: null,
  selectedClient: null,
  selectedProduct: null,
  selectedPayment: null,
  isExchange: false,
  isFragile: false,
  termsAccepted: false,
  quantity: 1,
  productPrice: 0,
  totalAmount: 0,
  defaultStatus: null,
};

const livraisonSlice = createSlice({
  name: 'livraison',
  initialState,
  reducers: {
    setSelectedAddress: (state, action) => { state.selectedAddress = action.payload },
    setSelectedClient: (state, action) => { state.selectedClient = action.payload },
    setSelectedProduct: (state, action) => { state.selectedProduct = action.payload },
    setSelectedPayment: (state, action) => { state.selectedPayment = action.payload },
    setIsExchange: (state, action) => { state.isExchange = action.payload },
    setIsFragile: (state, action) => { state.isFragile = action.payload },
    setTermsAccepted: (state, action) => { state.termsAccepted = action.payload },
    setQuantity: (state, action) => { state.quantity = action.payload },
    setProductPrice: (state, action) => { state.productPrice = action.payload },
    setTotalAmount: (state, action) => { state.totalAmount = action.payload },
    setDefaultStatus: (state, action) => { state.defaultStatus = action.payload },
  },
});

export const {
  setSelectedAddress, setSelectedClient, setSelectedProduct, setSelectedPayment,
  setIsExchange, setIsFragile, setTermsAccepted, setQuantity,
  setProductPrice, setTotalAmount, setDefaultStatus,
} = livraisonSlice.actions;

export default livraisonSlice.reducer;
