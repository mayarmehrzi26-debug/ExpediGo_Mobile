import { configureStore } from "@reduxjs/toolkit";
import livraisonReducer from "./livraisonSlice";

export const store = configureStore({
  reducer: {
    livraison: livraisonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
