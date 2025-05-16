import { Client } from "../../model/Client";

export const FETCH_CLIENTS = "FETCH_CLIENTS";

export const fetchClientsSuccess = (clients: Client[]) => ({
  type: FETCH_CLIENTS,
  payload: clients,
});