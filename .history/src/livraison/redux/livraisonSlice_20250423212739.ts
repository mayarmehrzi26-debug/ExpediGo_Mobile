import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCollection } from '../service/firebaseService';
import { RootState } from './store';

// Interfaces
interface Produit {
  label: string;
  value: string;
  image?: string;
  price: number;
}

interface Client {
  label: string;
  value: string;
}

interface Adresse {
  label: string;
  value: string;
}

interface PaiementOption {
  label: string;
  value: string;
}

interface LivraisonState {
  produits: Produit[];
  clients: Client[];
  adresses: Adresse[];
  paiementOptions: PaiementOption[];
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

const initialState: LivraisonState = {
  produits: [],
  clients: [],
  adresses: [],
  paiementOptions: [],
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
export const fetchProduits = createAsyncThunk(
  "livraison/fetchProduits",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("products");
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
        image: doc.data.imageUrl,
        price: doc.data.amount,
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des produits");
    }
  }
);

export const fetchClients = createAsyncThunk(
  "livraison/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("clients");
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des clients");
    }
  }
);

export const fetchAdresses = createAsyncThunk(
  "livraison/fetchAdresses",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("addresses");
      return data.map(doc => ({
        label: doc.data.fullAddress,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des adresses");
    }
  }
);

export const fetchPaiementOptions = createAsyncThunk(
  "livraison/fetchPaiementOptions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("paymentOptions");
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des options de paiement");
    }
  }
);

export const saveNewDelivery = createAsyncThunk(
  "livraison/saveNewDelivery",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { livraison } = state;
      
      // Ici vous implémenteriez la logique de sauvegarde
      // Par exemple, appel à une API Firebase
      
      return true; // Retourne true si la sauvegarde réussit
    } catch (error) {
      return rejectWithValue("Erreur lors de l'enregistrement");
    }
  }
);

const livraisonSlice = createSlice({
  name: "livraison",
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
    },
    setSelectedPayment: (state, action: PayloadAction<string | null>) => {
      state.selectedPayment = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
      // Recalculer le totalAmount si nécessaire
      if (state.selectedProduct) {
        const product = state.produits.find(p => p.value === state.selectedProduct);
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
    clearSelection: (state) => {
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
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduits.fulfilled, (state, action) => {
        state.produits = action.payload;
        state.loading = false;
      })
      .addCase(fetchProduits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdresses.fulfilled, (state, action) => {
        state.adresses = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaiementOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaiementOptions.fulfilled, (state, action) => {
        state.paiementOptions = action.payload;
        state.loading = false;
      })
      .addCase(fetchPaiementOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveNewDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveNewDelivery.fulfilled, (state) => {
        state.loading = false;
        // Réinitialiser le formulaire après sauvegarde
        state.selectedAddress = null;
        state.selectedClient = null;
        state.selectedProduct = null;
        state.selectedPayment = null;
        state.quantity = 1;
        state.isExchange = false;
        state.isFragile = false;
        state.termsAccepted = false;
        state.totalAmount = 0;
      })
      .addCase(saveNewDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const { 
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  toggleExchange,
  toggleFragile,
  toggleTermsAccepted,
  clearSelection,
  resetError,
} = livraisonSlice.actions;

// Export du reducer
export default livraisonSlice.reducer;

// Selecteurs
export const selectNouvelleLivraisonState = (state: RootState) => state.livraison;
export const selectAllProduits = (state: RootState) => state.livraison.produits;
export const selectAllClients = (state: RootState) => state.livraison.clients;
export const selectAllAdresses = (state: RootState) => state.livraison.adresses;
export const selectAllPaiementOptions = (state: RootState) => state.livraison.paiementOptions;
export const selectLoading = (state: RootState) => state.livraison.loading;
export const selectError = (state: RootState) => state.livraison.error;
export const selectSelectedAddress = (state: RootState) => state.livraison.selectedAddress;
export const selectSelectedClient = (state: RootState) => state.livraison.selectedClient;
export const selectSelectedProduct = (state: RootState) => state.livraison.selectedProduct;
export const selectSelectedPayment = (state: RootState) => state.livraison.selectedPayment;
export const selectQuantity = (state: RootState) => state.livraison.quantity;
export const selectIsExchange = (state: RootState) => state.livraison.isExchange;
export const selectIsFragile = (state: RootState) => state.livraison.isFragile;
export const selectTermsAccepted = (state: RootState) => state.livraison.termsAccepted;
export const selectTotalAmount = (state: RootState) => state.livraison.totalAmount;