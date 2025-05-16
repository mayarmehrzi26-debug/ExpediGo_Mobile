import { EmballageOrder } from "../models/EmballageModel";
export const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
export const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
export const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';

export const fetchOrdersRequest = () => ({
  type: FETCH_ORDERS_REQUEST
});

export const fetchOrdersSuccess = (orders: EmballageOrder[]) => ({
  type: FETCH_ORDERS_SUCCESS,
  payload: orders
});

export const fetchOrdersFailure = (error: string) => ({
  type: FETCH_ORDERS_FAILURE,
  payload: error
});