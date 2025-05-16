import { configureStore } from '@reduxjs/toolkit';
import deliveryReducer from './deliverySlice';

export const store = configureStore({
  reducer: {
    delivery: deliveryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;