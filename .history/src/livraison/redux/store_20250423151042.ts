import { configureStore } from "@reduxjs/toolkit";
import { addressReducer } from "./reducers/addressReducer";
import { clientReducer } from "./reducers/clientReducer";
import { deliveryReducer } from "./reducers/deliveryReducer";
import { productReducer } from "./reducers/productReducer";
export const store = configureStore({
  reducer: {
    delivery: deliveryReducer,
    product: productReducer,
    client: clientReducer,
    address: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
