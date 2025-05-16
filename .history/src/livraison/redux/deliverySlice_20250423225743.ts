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

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setIsExchange(state, action: PayloadAction<boolean>) {
      state.isExchange = action.payload;
    },
    setIsFragile(state, action: PayloadAction<boolean>) {
      state.isFragile = action.payload;
    },
    setTermsAccepted(state, action: PayloadAction<boolean>) {
      state.termsAccepted = action.payload;
    },
    setSelectedAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedAddress = action.payload;
    },
    setSelectedClient(state, action: PayloadAction<string | null>) {
      state.selectedClient = action.payload;
    },
    setSelectedProduct(state, action: PayloadAction<string | null>) {
      state.selectedProduct = action.payload;
      if (action.payload) {
        state.totalAmount = state.quantity * state.productPrice;
      }
    },
    setSelectedPayment(state, action: PayloadAction<string | null>) {
      state.selectedPayment = action.payload;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
      state.totalAmount = action.payload * state.productPrice;
    },
    setProductPrice(state, action: PayloadAction<number>) {
      state.productPrice = action.payload;
      state.totalAmount = state.quantity * action.payload;
    },
    resetDeliveryForm(state) {
      Object.assign(state, initialState);
    },
  },
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