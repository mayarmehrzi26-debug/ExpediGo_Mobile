import { configureStore } from "@reduxjs/toolkit";
import { deliveryReducer } from "./reducers/deliveryReducer";
import { productReducer } from "./reducers/productReducer";
import { clientReducer } from "./reducers/clientReducer";
import { addressReducer } from "./reducers/addressReducer";

export const store = configureStore({
 
    delivery: deliveryReducer,
    product: productReducer,
    client: clientReducer,
    address: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;