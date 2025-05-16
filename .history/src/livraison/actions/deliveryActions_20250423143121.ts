import { Delivery } from "../../models/Delivery";

export const SAVE_DELIVERY = "SAVE_DELIVERY";

export const saveDelivery = (delivery: Delivery) => ({
  type: SAVE_DELIVERY,
  payload: delivery,
});