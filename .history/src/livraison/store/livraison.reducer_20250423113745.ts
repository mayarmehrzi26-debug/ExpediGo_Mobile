import { createReducer } from "@reduxjs/toolkit";
import { Delivery, DropdownOption } from "../model/livraison.model";
import {
    resetDeliveryForm,
    setAdresses,
    setClients,
    setDefaultStatus,
    setDeliveryField,
    setProducts
} from "./livraison.actions";

interface DeliveryState {
  form: Omit<Delivery, "id" | "createdAt" | "qrCodeUrl"> & {
    products: DropdownOption[];
    clients: DropdownOption[];
    adresses: DropdownOption[];
    defaultStatus: string | null;
  };
}

const initialState: DeliveryState = {
 form: {
    products: [],
    clients: [],
    adresses: [],
    // Add all other initial form fields
    address: '',
    client: '',
    product: '',
    payment: '',
    isExchange: false,
    isFragile: false,
    termsAccepted: false,
    quantity: 1,
    totalAmount: 0,
    status: null,
  }
};

export const deliveryReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setDeliveryField, (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
      
      // Recalcul du montant total si quantité ou produit changé
      if (field === "quantity" || field === "product") {
        const selectedProduct = state.form.products.find(p => p.value === state.form.product);
        state.form.totalAmount = state.form.quantity * (selectedProduct?.price || 0);
      }
    })
    .addCase(setProducts, (state, action) => {
      state.form.products = action.payload;
    })
    .addCase(setClients, (state, action) => {
      state.form.clients = action.payload;
    })
    .addCase(setAdresses, (state, action) => {
      state.form.adresses = action.payload;
    })
    .addCase(setDefaultStatus, (state, action) => {
      state.form.defaultStatus = action.payload;
      state.form.status = action.payload;
    })
    .addCase(resetDeliveryForm, () => initialState);
});