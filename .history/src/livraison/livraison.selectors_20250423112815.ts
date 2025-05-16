import { createSelector } from '@reduxjs/toolkit';
import { RootState } from "../store";

const selectDeliveryState = (state: RootState) => state.delivery;

export const selectDeliveryForm = createSelector(
  selectDeliveryState,
  (delivery) => delivery.form
);

export const selectProducts = createSelector(
  selectDeliveryForm,
  (form) => form.products
);

export const selectClients = createSelector(
  selectDeliveryForm,
  (form) => form.clients
);

export const selectAdresses = createSelector(
  selectDeliveryForm,
  (form) => form.adresses
);