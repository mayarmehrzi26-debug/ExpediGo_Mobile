import { createAction } from "@reduxjs/toolkit";
import { DropdownOption } from "../model/livraison.model";

export const setDeliveryField = createAction<{ field: string; value: any }>("livraison/setField");
export const setProducts = createAction<DropdownOption[]>("livraison/setProducts");
export const setClients = createAction<DropdownOption[]>("livraison/setClients");
export const setAdresses = createAction<DropdownOption[]>("livraison/setAdresses");
export const setDefaultStatus = createAction<string | null>("livraison/setDefaultStatus");
export const resetDeliveryForm = createAction("livraison/resetForm");