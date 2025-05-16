import { Product } from "../../model/Product";
import { FETCH_PRODUCTS } from "../actions/productActions";
const initialState = {
  products: [] as Product[],
};

export const productReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FETCH_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };
    default:
      return state;
  }
};
