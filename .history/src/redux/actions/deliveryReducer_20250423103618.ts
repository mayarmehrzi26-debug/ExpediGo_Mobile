import {
  CREATE_DELIVERY,
  DeliveryActionTypes,
  DeliveryDetails,
  FETCH_ADDRESSES,
  FETCH_CLIENTS,
  FETCH_DELIVERY_DETAILS_FAILURE,
  FETCH_DELIVERY_DETAILS_START,
  FETCH_DELIVERY_DETAILS_SUCCESS,
  FETCH_PRODUCTS,
  FETCH_STATUS
} from '../../types';

interface DeliveryState {
  products: any[];
  clients: any[];
  addresses: any[];
  defaultStatus: string | null;
  currentDelivery: DeliveryDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeliveryState = {
  products: [],
  clients: [],
  addresses: [],
  defaultStatus: null,
  currentDelivery: null,
  loading: false,
  error: null
};

export const deliveryReducer = (
  state = initialState,
  action: DeliveryActionTypes
): DeliveryState => {
  switch (action.type) {
    case FETCH_PRODUCTS:
      return { 
        ...state, 
        products: action.payload,
        error: null 
      };
      
    case FETCH_CLIENTS:
      return { 
        ...state, 
        clients: action.payload,
        error: null 
      };
      
    case FETCH_ADDRESSES:
      return { 
        ...state, 
        addresses: action.payload,
        error: null 
      };
      
    case FETCH_STATUS:
      return { 
        ...state, 
        defaultStatus: action.payload,
        error: null 
      };
      
    case CREATE_DELIVERY:
      return {
        ...state,
        loading: false,
        error: null
      };
      
    case FETCH_DELIVERY_DETAILS_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case FETCH_DELIVERY_DETAILS_SUCCESS:
      return {
        ...state,
        currentDelivery: action.payload,
        loading: false,
        error: null
      };
      
    case FETCH_DELIVERY_DETAILS_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    default:
      return state;
  }
};

export default deliveryReducer;