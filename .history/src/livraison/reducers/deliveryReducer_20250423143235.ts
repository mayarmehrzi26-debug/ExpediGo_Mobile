import { SAVE_DELIVERY } from "../actions/deliveryActions";
import { Delivery } from "../model/Delivery";

const initialState = {
  deliveries: [] as Delivery[],
};

export const deliveryReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SAVE_DELIVERY:
      return {
        ...state,
        deliveries: [...state.deliveries, action.payload],
      };
    default:
      return state;
  }
};