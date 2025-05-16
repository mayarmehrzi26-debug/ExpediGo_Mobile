import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeliveryState {
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  selectedAddress: string | null;
  selectedClient: string | null;
  selectedProduct: string | null;
  selectedPayment: string | null;
  quantity: number;
  productPrice: number;
  totalAmount: number;
}

const initialState: DeliveryState = {
  isExchange: false,
  isFragile: false,
  termsAccepted: false,
  selectedAddress: null,
  selectedClient: null,
  selectedProduct: null,
  selectedPayment: null,
  quantity: 1,
  productPrice: 0,
  totalAmount: 0,
};

// deliverySlice.ts
const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<string | null>) => {
      console.log('Setting address:', action.payload); // Debug
      state.selectedAddress = action.payload;
    },
    setSelectedClient: (state, action: PayloadAction<string | null>) => {
      console.log('Setting client:', action.payload); // Debug
      state.selectedClient = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<string | null>) => {
      console.log('Setting product:', action.payload); // Debug
      state.selectedProduct = action.payload;
    },
    // ... autres reducers
  }
});

export const {
  setIsExchange,
  setIsFragile,
  setTermsAccepted,
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  setProductPrice,
  resetDeliveryForm,
} = deliverySlice.actions;

export default deliverySlice.reducer;