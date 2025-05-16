import { Livraison } from "../models/Livraison";
import { LivraisonService } from "../services/LivraisonService";

export class LivraisonPresenter {
  static async loadDropdownOptions(
    collectionName: string,
    labelField: string,
    extraFields: string[] = []
  ) {
    return await LivraisonService.getDropdownOptions(collectionName, labelField, extraFields);
  }

  static async createNewDelivery(deliveryData: Omit<Livraison, 'id' | 'qrCodeUrl' | 'createdAt'>) {
    const newDelivery: Livraison = {
      ...deliveryData,
      id: this.generateId(),
      qrCodeUrl: LivraisonService.generateQRCode(this.generateId()),
      createdAt: new Date(),
    };

    await LivraisonService.saveNewDelivery(newDelivery);
    return newDelivery;
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}