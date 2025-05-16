import { Address } from "../";
import { FETCH_ADDRESSES } from "../actions/addressActions";

const initialState = {
  addresses: [] as Address[],
};

export const addressReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FETCH_ADDRESSES:
      return {
        ...state,
        addresses: action.payload,
      };
    default:
      return state;
  }
};