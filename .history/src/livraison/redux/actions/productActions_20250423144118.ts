import { Product } from "../../model/Product";

export const FETCH_PRODUCTS = "FETCH_PRODUCTS";

export const fetchProductsSuccess = (products: Product[]) => ({
  type: FETCH_PRODUCTS,
  payload: products,
});