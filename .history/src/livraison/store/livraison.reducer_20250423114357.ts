import { createReducer } from "@reduxjs/toolkit";
import { DeliveryFormState } from "../livraison.modelmodel/";
import { 
  setDeliveryField, 
  setProducts, 
  setClients, 
  setAdresses, 
  setDefaultStatus,
  resetDeliveryForm
} from "./livraison.actions";

const initialState: DeliveryFormState = {
  form: {
    address: "",
    client: "",
    product: "",
    payment: "",
    isExchange: false,
    isFragile: false,
    termsAccepted: false,
    quantity: 1,
    totalAmount: 0,
    status: null,
    products: [],
    clients: [],
    adresses: [],
    defaultStatus: null,
  },
  isLoading: false,
  error: null
};

export const deliveryReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setDeliveryField, (state, action) => {
      const { field, value } = action.payload;
      if (field in state.form) {
        state.form[field] = value;
        
        if (field === "quantity" || field === "product") {
          const selectedProduct = state.form.products.find(p => p.value === state.form.product);
          state.form.totalAmount = state.form.quantity * (selectedProduct?.price || 0);
        }
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