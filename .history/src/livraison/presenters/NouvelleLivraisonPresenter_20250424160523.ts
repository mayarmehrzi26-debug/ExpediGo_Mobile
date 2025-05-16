import { NouvelleLivraisonModel } from "../models/Livraison";
import { DeliveryData } from "../types";

export class NouvelleLivraisonPresenter {
  private model: NouvelleLivraisonModel;

  constructor() {
    this.model = new NouvelleLivraisonModel();
  }

  async fetchInitialData() {
    const [products, clients, adresses, defaultStatus] = await Promise.all([
      this.model.(),
      this.model.fetchClients(),
      this.model.fetchAdresses(),
      this.model.fetchDefaultStatus(),
    ]);

    return { products, clients, adresses, defaultStatus };
  }

  async saveDelivery(
    selectedAddress: string | null,
    selectedClient: string | null,
    selectedProduct: string | null,
    selectedPayment: string | null,
    isExchange: boolean,
    isFragile: boolean,
    termsAccepted: boolean,
    quantity: number,
    totalAmount: number,
    defaultStatus: string | null
  ): Promise<{ success: boolean; message: string }> {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      return { success: false, message: "Veuillez remplir tous les champs obligatoires." };
    }

    try {
      const newId = Math.floor(Math.random() * 1000000).toString();
      const qrCodeUrl = NouvelleLivraisonModel.generateQRCode(newId);

      const deliveryData: DeliveryData = {
        id: newId,
        address: selectedAddress,
        client: selectedClient,
        product: selectedProduct,
        payment: selectedPayment,
        isExchange,
        isFragile,
        termsAccepted,
        quantity,
        totalAmount,
        createdAt: new Date(),
        status: defaultStatus,
        qrCodeUrl,
      };

      await this.model.saveDelivery(deliveryData);
      return { success: true, message: "Livraison enregistrée avec succès !" };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la livraison : ", error);
      return { success: false, message: "Une erreur s'est produite lors de l'enregistrement de la livraison." };
    }
  }
}