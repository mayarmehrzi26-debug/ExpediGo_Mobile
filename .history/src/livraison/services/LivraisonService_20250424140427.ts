import { fetchCollection, saveDocument } from "./FirebaseService";
import { Livraison, DropdownOption } from "../models/Livraison";

export class LivraisonService {
  static async getDropdownOptions(
    collectionName: string, 
    labelField: string, 
    extraFields: string[] = []
  ): Promise<DropdownOption[]> {
    const docs = await fetchCollection(collectionName);
    return docs.map((doc) => {
      const option: any = {
        label: doc.data[labelField],
        value: doc.id,
      };
      extraFields.forEach((field) => (option[field] = doc.data[field]));
      return option;
    });
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }

  static async saveNewDelivery(delivery: Livraison): Promise<void> {
    await saveDocument("livraisons", delivery.id, delivery);
  }
}