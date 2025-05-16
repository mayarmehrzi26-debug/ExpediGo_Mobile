import { Client } from "../../models/Client";
import { FETCH_CLIENTS } from "../actions/clientActions";

const initialState = {
  clients: [] as Client[],
};

export const clientReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FETCH_CLIENTS:
      return {
        ...state,
        clients: action.payload,
      };
    default:
      return state;
  }
};