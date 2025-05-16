import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCollection } from '../services/firebaseService';

export const fetchProduits = createAsyncThunk("livraison/fetchProduits", async () => {
  const data = await fetchCollection("products");
  return data.map(doc => ({
    label: doc.data.name,
    value: doc.id,
    image: doc.data.imageUrl,
    price: doc.data.amount,
  }));
});

// Ajoute aussi pour fetchClients, fetchAdresses...

const livraisonSlice = createSlice({
  name: "livraison",
  initialState: {
    produits: [],
    clients: [],
    adresses: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProduits.fulfilled, (state, action) => {
      state.produits = action.payload;
    });
  },
});

export default livraisonSlice.reducer;
