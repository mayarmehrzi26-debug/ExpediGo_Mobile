import { RootState } from "./store"; // Chemin correct vers votre store principal

// Sélecteur racine pour le feature 'delivery'
const selectDeliveryState = (state: RootState) => state.delivery;

// Sélecteur pour le formulaire de livraison
export const selectDeliveryForm = (state: RootState) => 
  selectDeliveryState(state).form;

// Sélecteurs spécifiques (optimisés avec createSelector si besoin)
export const selectProducts = (state: RootState) => 
  selectDeliveryForm(state).products;

export const selectClients = (state: RootState) => 
  selectDeliveryForm(state).clients;

export const selectAdresses = (state: RootState) => 
  selectDeliveryForm(state).adresses;