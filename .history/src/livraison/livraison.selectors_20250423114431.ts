import { RootState } from "../../store";
import { initialState } from "../livraison.reducer";

export const selectDeliveryState = (state: RootState) => state.delivery || initialState;

export const selectDeliveryForm = (state: RootState) => 
  selectDeliveryState(state).form;

export const selectProducts = (state: RootState) => 
  selectDeliveryForm(state).products || [];

export const selectClients = (state: RootState) => 
  selectDeliveryForm(state).clients || [];

export const selectAdresses = (state: RootState) => 
  selectDeliveryForm(state).adresses || [];

export const selectIsLoading = (state: RootState) => 
  selectDeliveryState(state).isLoading;

export const selectError = (state: RootState) => 
  selectDeliveryState(state).error;