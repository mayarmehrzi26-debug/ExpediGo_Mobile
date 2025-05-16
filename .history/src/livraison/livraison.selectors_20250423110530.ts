import { RootState } from "../";

export const selectDeliveryForm = (state: RootState) => state.delivery.form;
export const selectProducts = (state: RootState) => state.delivery.form.products;
export const selectClients = (state: RootState) => state.delivery.form.clients;
export const selectAdresses = (state: RootState) => state.delivery.form.adresses;