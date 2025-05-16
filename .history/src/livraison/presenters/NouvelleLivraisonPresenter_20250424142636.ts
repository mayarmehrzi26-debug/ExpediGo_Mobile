import { Livraison } from "../models/Livraison";
import { fetchCollection, saveDocument } from "../services/FirebaseService";

export const getDropdownOptions = async (collectionName: string, labelField: string, extraFields: string[] = []) => {
  const docs = await fetchCollection(collectionName);
  return docs.map((doc) => {
    const option: any = {
      label: doc.data[labelField],
      value: doc.id,
    };
    extraFields.forEach((field) => (option[field] = doc.data[field]));
    return option;
  });
};

export const generateQRCode = (deliveryId: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;

export const saveNewDelivery = async (delivery: Livraison) => {
  await saveDocument("livraisons", delivery.id, delivery);
};
