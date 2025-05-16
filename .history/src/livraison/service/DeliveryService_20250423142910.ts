import { collection, doc, setDoc } from "firebase/firestore";
import { firebasestore } from "../../FirebaseConfig";
import { Delivery } from "../models/Delivery";

export const DeliveryService = {
  saveDelivery: async (delivery: Delivery) => {
    await setDoc(doc(firebasestore, "livraisons", delivery.id), delivery);
  },

  generateQRCode: (deliveryId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  },
};