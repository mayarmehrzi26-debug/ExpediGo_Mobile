import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCollection, saveDeliveryToFirebase } from '../service/firebaseService';
import { RootState } from './store';

interface Product {
  label: string;
  value: string;
  price: number;
  image?: string;
}

interface Client {
  label: string;
  value: string;
}

interface Address {
  label: string;
  value: string;
}

interface PaymentOption {
  label: string;
  value: string;
}

interface DeliveryState {
  addresses: Address[];
  clients: Client[];
  products: Product[];
  paymentOptions: PaymentOption[];
  selectedAddress: string | null;
  selectedClient: string | null;
  selectedProduct: string | null;
  selectedPayment: string | null;
  quantity: number;
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

const initialState: DeliveryState = {
  addresses: [],
  clients: [],
  products: [],
  paymentOptions: [],
  selectedAddress: null,
  selectedClient: null,
  selectedProduct: null,
  selectedPayment: null,
  quantity: 1,
  isExchange: false,
  isFragile: false,
  termsAccepted: false,
  totalAmount: 0,
  loading: false,
  error: null,
};

// Thunks
export const fetchProducts = createAsyncThunk(
  'delivery/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection('products');
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
        price: doc.data.price,
        image: doc.data.imageUrl,
      }));
    } catch (error) {
      return rejectWithValue('Failed to load products');
    }
  }
);

export const fetchClients = createAsyncThunk(
  'delivery/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection('clients');
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue('Failed to load clients');
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  'delivery/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection('addresses');
      return data.map(doc => ({
        label: doc.data.fullAddress,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue('Failed to load addresses');
    }
  }
);

export const fetchPaymentOptions = createAsyncThunk(
  'delivery/fetchPaymentOptions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection('paymentOptions');
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue('Failed to load payment options');
    }
  }
);

export const saveNewDelivery = createAsyncThunk(
  'delivery/saveNewDelivery',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { delivery } = state;
    
    try {
      const deliveryData = {
        address: delivery.selectedAddress,
        client: delivery.selectedClient,
        product: delivery.selectedProduct,
        payment: delivery.selectedPayment,
        quantity: delivery.quantity,
        isExchange: delivery.isExchange,
        isFragile: delivery.isFragile,
        totalAmount: delivery.totalAmount,
      };
      
      await saveDeliveryToFirebase(deliveryData);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedAddress = action.payload;
    },
    setSelectedClient: (state, action: PayloadAction<string | null>) => {
      state.selectedClient = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<string | null>) => {
      state.selectedProduct = action.payload;
      // Recalculate total when product changes
      if (action.payload) {
        const product = state.products.find(p => p.value === action.payload);
        if (product) {
          state.totalAmount = product.price * state.quantity;
        }
      }
    },
    setSelectedPayment: (state, action: PayloadAction<string | null>) => {
      state.selectedPayment = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
      if (state.selectedProduct) {
        const product = state.products.find(p => p.value === state.selectedProduct);
        if (product) {
          state.totalAmount = product.price * action.payload;
        }
      }
    },
    toggleExchange: (state) => {
      state.isExchange = !state.isExchange;
    },
    toggleFragile: (state) => {
      state.isFragile = !state.isFragile;
    },
    toggleTermsAccepted: (state) => {
      state.termsAccepted = !state.termsAccepted;
    },
    resetDeliveryForm: (state) => {
      state.selectedAddress = null;
      state.selectedClient = null;
      state.selectedProduct = null;
      state.selectedPayment = null;
      state.quantity = 1;
      state.isExchange = false;
      state.isFragile = false;
      state.termsAccepted = false;
      state.totalAmount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.loading = false;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchPaymentOptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentOptions.fulfilled, (state, action) => {
        state.paymentOptions = action.payload;
        state.loading = false;
      })
      .addCase(fetchPaymentOptions.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(saveNewDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveNewDelivery.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveNewDelivery.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const {
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  toggleExchange,
  toggleFragile,
  toggleTermsAccepted,
  resetDeliveryForm,
  clearError,
} = deliverySlice.actions;

export default deliverySlice.reducer;

// Selectors
export const selectDeliveryState = (state: RootState) => state.delivery;
export const selectAddresses = (state: RootState) => state.delivery.addresses;
export const selectClients = (state: RootState) => state.delivery.clients;
export const selectProducts = (state: RootState) => state.delivery.products;
export const selectPaymentOptions = (state: RootState) => state.delivery.paymentOptions;
export const selectSelectedAddress = (state: RootState) => state.delivery.selectedAddress;
export const selectSelectedClient = (state: RootState) => state.delivery.selectedClient;
export const selectSelectedProduct = (state: RootState) => state.delivery.selectedProduct;
export const selectSelectedPayment = (state: RootState) => state.delivery.selectedPayment;
export const selectQuantity = (state: RootState) => state.delivery.quantity;
export const selectIsExchange = (state: RootState) => state.delivery.isExchange;
export const selectIsFragile = (state: RootState) => state.delivery.isFragile;
export const selectTermsAccepted = (state: RootState) => state.delivery.termsAccepted;
export const selectTotalAmount = (state: RootState) => state.delivery.totalAmount;
export const selectLoading = (state: RootState) => state.delivery.loading;
export const selectError = (state: RootState) => state.delivery.error;