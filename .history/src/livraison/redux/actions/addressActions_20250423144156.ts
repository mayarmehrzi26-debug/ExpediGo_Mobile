import { Address } from "../../model/Address";

export const FETCH_ADDRESSES = "FETCH_ADDRESSES";

export const fetchAddressesSuccess = (addresses: Address[]) => ({
  type: FETCH_ADDRESSES,
  payload: addresses,
});