import { NouvelleLivraisonModel } from "../models/NouvelleLivraisonModel";
import { DeliveryData } from "../types";

export class NouvelleLivraisonPresenter {
  public model: NouvelleLivraisonModel;

  constructor() {
    this.model = new NouvelleLivraisonModel();
  }

  async fetchInitialData() {
    try {
      const [products, clients, adresses, defaultStatus] = await Promise.all([
        this.model.fetchProducts(),
        this.model.fetchClients(),
        this.model.fetchAdresses(),
        this.model.fetchDefaultStatus(),  // Removed the incorrect model assignment
      ]);
  
      console.log('Data loaded:', { products, clients, adresses });
  
      return { 
        products: products || [], 
        clients: clients || [], 
        adresses: adresses || [], 
        defaultStatus 
      };
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      return { products: [], clients: [], adresses: [], defaultStatus: null };
    }
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