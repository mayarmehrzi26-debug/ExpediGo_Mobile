import { configureStore } from "@reduxjs/toolkit";
import livraisonReducer from "./livraisonSlice";

export const store = configureStore({
  reducer: {
    livraison: livraisonReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Désactive le check de sérialisation pour les Dates, etc.
    }),
});

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;