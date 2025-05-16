import { EmballageOrder } from "./models/EmballageModel";

export const CREATE_DELIVERY = 'CREATE_DELIVERY';
export const FETCH_PRODUCTS = 'FETCH_PRODUCTS';
export const FETCH_CLIENTS = 'FETCH_CLIENTS';
export const FETCH_ADDRESSES = 'FETCH_ADDRESSES';
export const FETCH_STATUS = 'FETCH_STATUS';
export const FETCH_DELIVERY_DETAILS_START = 'FETCH_DELIVERY_DETAILS_START';
export const FETCH_DELIVERY_DETAILS_SUCCESS = 'FETCH_DELIVERY_DETAILS_SUCCESS';
export const FETCH_DELIVERY_DETAILS_FAILURE = 'FETCH_DELIVERY_DETAILS_FAILURE';

export interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
  price?: number;
}

// Types pour les livraisons
export type DeliveryStatus = 'En attente' | 'En cours' | 'Livré' | 'Retour' | 'Échange' | 'Annulé';
export type DeliveryFilterOption = 'Toutes' | 'Livrés' | 'Retours' | 'Échanges';

export interface Delivery {
  id: string;
  address: string;
  client: string;
  product: string;
  payment: string;
  status: DeliveryStatus;
  isExchange: boolean;
  isFragile: boolean;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
  qrCodeUrl: string;
}

export interface DeliveryDetails extends Delivery {
  destination: string;
}

export interface DeliveryData {
  id: string;
  address: string | null;
  client: string | null;
  product: string | null;
  payment: string | null;
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  quantity: number;
  totalAmount: number;
  status: string | null;
  qrCodeUrl: string;
  createdAt: string | Date;
}

export interface EmballageState {
  orders: EmballageOrder[];
  loading: boolean;
  error: string | null;
}

export interface DeliveryState {
  products: DropdownOption[];
  clients: DropdownOption[];
  addresses: DropdownOption[];
  defaultStatus: string | null;
  currentDelivery: DeliveryDetails | null;
  loading: boolean;
  error: string | null;
}

// Actions
interface CreateDeliveryAction {
  type: typeof CREATE_DELIVERY;
  payload: DeliveryData;
}

interface FetchProductsAction {
  type: typeof FETCH_PRODUCTS;
  payload: DropdownOption[];
}

interface FetchClientsAction {
  type: typeof FETCH_CLIENTS;
  payload: DropdownOption[];
}

interface FetchAddressesAction {
  type: typeof FETCH_ADDRESSES;
  payload: DropdownOption[];
}

interface FetchStatusAction {
  type: typeof FETCH_STATUS;
  payload: string;
}

interface FetchDeliveryDetailsStartAction {
  type: typeof FETCH_DELIVERY_DETAILS_START;
}

interface FetchDeliveryDetailsSuccessAction {
  type: typeof FETCH_DELIVERY_DETAILS_SUCCESS;
  payload: DeliveryDetails;
}

interface FetchDeliveryDetailsFailureAction {
  type: typeof FETCH_DELIVERY_DETAILS_FAILURE;
  payload: string;
}

export type DeliveryActionTypes = 
  | CreateDeliveryAction 
  | FetchProductsAction 
  | FetchClientsAction 
  | FetchAddressesAction 
  | FetchStatusAction
  | FetchDeliveryDetailsStartAction
  | FetchDeliveryDetailsSuccessAction
  | FetchDeliveryDetailsFailureAction;