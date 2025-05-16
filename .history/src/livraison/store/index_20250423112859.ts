// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import deliveryReducer from './livraison/livraison.reducer';

export const store = configureStore({
  reducer: {
    delivery: deliveryReducer,
    // autres reducers...
  },
});

// Export des types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;