import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCollection } from '../service/firebaseService';
import { RootState } from './store'; // Corrigez le chemin d'importation

// Définissez les interfaces avant leur utilisation
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

interface LivraisonState {
  adresses: any[];
  clients: any[];
  products: any[];
  paiementOptions: any[];
  selectedAddress: string | null;
  selectedClient: string | null;
  selectedProduct: string | null;
  selectedPayment: string | null;
  quantity: number;
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  totalAmount: number;
  // Ajoutez d'autres champs si nécessaire
}

const initialState: LivraisonState = {
  adresses: [],
  clients: [],
  products: [],
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
};

// Thunk pour récupérer les produits
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

// Thunk pour récupérer les clients
export const fetchClients = createAsyncThunk(
  "livraison/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("clients");
      return data.map(doc => ({
        label: doc.data.name,
        value: doc.id,
        // autres propriétés client...
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des clients");
    }
  }
);

// Thunk pour récupérer les adresses
export const fetchAdresses = createAsyncThunk(
  "livraison/fetchAdresses",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCollection("addresses");
      return data.map(doc => ({
        label: doc.data.fullAddress,
        value: doc.id,
        // autres propriétés adresse...
      }));
    } catch (error) {
      return rejectWithValue("Erreur lors du chargement des adresses");
    }
  }
);

const livraisonSlice = createSlice({
  name: "livraison",
  initialState,
  reducers: {
    selectProduit: (state, action: PayloadAction<string>) => {
      state.selectedProduct = action.payload;
    },
    selectClient: (state, action: PayloadAction<string>) => {
      state.selectedClient = action.payload;
    },
    selectAdresse: (state, action: PayloadAction<string>) => {
      state.selectedAddress = action.payload;
    },
    clearSelection: (state) => {
      state.selectedProduct = null;
      state.selectedClient = null;
      state.selectedAddress = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Gestion des états pour fetchProduits
    builder.addCase(fetchProduits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProduits.fulfilled, (state, action) => {
      state.produits = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchProduits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Gestion des états pour fetchClients
    builder.addCase(fetchClients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchClients.fulfilled, (state, action) => {
      state.clients = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Gestion des états pour fetchAdresses
    builder.addCase(fetchAdresses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdresses.fulfilled, (state, action) => {
      state.adresses = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchAdresses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Export des actions
export const { 
  selectProduit, 
  selectClient, 
  selectAdresse, 
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
export const selectLoading = (state: RootState) => state.livraison.loading;
export const selectError = (state: RootState) => state.livraison.error;
export const selectSelectedProduit = (state: RootState) => state.livraison.selectedProduit;
export const selectSelectedClient = (state: RootState) => state.livraison.selectedClient;
export const selectSelectedAdresse = (state: RootState) => state.livraison.selectedAdresse;