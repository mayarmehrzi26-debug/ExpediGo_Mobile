import { getAuth } from "firebase/auth";
import { LivraisonModel } from "../models/Livraison";
import { DeliveryData } from "../types";

export class NouvelleLivraisonPresenter {
  public model: LivraisonModel;

  constructor() {
    this.model = new LivraisonModel();
  }

  async fetchInitialData() {
    try {
      const [products, clients, adresses, defaultStatus] = await Promise.all([
        this.model.fetchProducts(),
        this.model.fetchClients(),
        this.model.fetchAdresses(),
        this.model.fetchDefaultStatus(),
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
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { success: false, message: "Utilisateur non connecté." };
    }

    const newId = Math.floor(Math.random() * 1000000).toString();
    const qrCodeUrl = LivraisonModel.generateQRCode(newId);

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
      status: defaultStatus || "Non traité",
      qrCodeUrl,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Sauvegarde de la livraison
    await this.model.saveDelivery(deliveryData);
    
    // Incrémente le compteur de livraisons pour ce client
    await this.model.incrementClientDeliveries(selectedClient);

    // Envoi de l'email de suivi
    const clientEmail = await this.model.getClientEmail(selectedClient);
    if (clientEmail) {
      await this.sendDeliveryEmail(clientEmail, newId, qrCodeUrl);
    }

    return { success: true, message: "Livraison enregistrée avec succès ! Un email de suivi a été envoyé au client." };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Une erreur inconnue est survenue" 
    };
  }
}

private async sendDeliveryEmail(email: string, deliveryId: string, qrCodeUrl: string): Promise<void> {
  try {
    const response = await fetch('http:// 20.20.16.177:3001/send-delivery-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        deliveryId,
        qrCodeUrl
      }),
    });

    if (!response.ok) {
      throw new Error('Échec de l\'envoi de l\'email');
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}
  async updateDelivery(
    deliveryId: string,
    selectedAddress: string | null,
    selectedClient: string | null,
    selectedProduct: string | null,
    selectedPayment: string | null,
    isExchange: boolean,
    isFragile: boolean,
    termsAccepted: boolean,
    quantity: number,
    totalAmount: number,
    status: string | null
  ): Promise<{ success: boolean; message: string }> {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      return { success: false, message: "Veuillez remplir tous les champs obligatoires." };
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return { success: false, message: "Utilisateur non connecté." };
      }

      const updatedData = {
        address: selectedAddress,
        client: selectedClient,
        product: selectedProduct,
        payment: selectedPayment,
        isExchange,
        isFragile,
        termsAccepted,
        quantity,
        totalAmount,
        status: status || "Non traité",
        updatedAt: new Date()
      };

      await this.model.updateDelivery(deliveryId, updatedData);
      return { success: true, message: "Livraison mise à jour avec succès !" };
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur inconnue est survenue" 
      };
    }
  }

  async cancelDelivery(deliveryId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.model.updateDeliveryStatus(deliveryId, "Annulée");
      return { success: true, message: "Livraison annulée avec succès" };
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur inconnue est survenue" 
      };
    }
  }
}