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
   selectedProducts: Array<{ 
    productId: string;
    quantity: number;
    price: number;
  }>,
  selectedPayment: string | null,
  isExchange: boolean,
  isFragile: boolean,
  termsAccepted: boolean,
  quantity: number,
  totalAmount: number,
  defaultStatus: string | null
): Promise<{ success: boolean; message: string }> {
  // Validation des champs obligatoires
  if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
    return { 
      success: false, 
      message: "Veuillez remplir tous les champs obligatoires." 
    };
  }

  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { 
        success: false, 
        message: "Utilisateur non connecté. Veuillez vous reconnecter." 
      };
    }

    // Génération de l'ID et QR Code
    const newId = Math.floor(Math.random() * 1000000).toString();
    const qrCodeUrl = LivraisonModel.generateQRCode(newId);

    // Préparation des données
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

    // 1. Sauvegarde de la livraison avec timeout
    const savePromise = this.model.saveDelivery(deliveryData);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout lors de l'enregistrement")), 10000)
    );

    await Promise.race([savePromise, timeoutPromise]);
    
    // 2. Incrémentation du compteur (non bloquant)
    this.model.incrementClientDeliveries(selectedClient)
      .catch(incError => console.warn("Incrémentation échouée:", incError));

    // 3. Envoi de l'email (non bloquant)
    this.sendDeliveryEmailWithRetry(selectedClient, newId, qrCodeUrl)
      .catch(emailError => console.error("Email échoué:", emailError));

    return { 
      success: true, 
      message: "Livraison enregistrée avec succès !" 
    };
  } catch (error) {
    console.error("Erreur système:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Erreur lors de l'enregistrement. Veuillez vérifier votre connexion."
    };
  }
}
private async sendDeliveryEmailWithRetry(
  clientId: string, 
  deliveryId: string, 
  qrCodeUrl: string,
  retries = 2
): Promise<void> {
  try {
    const clientEmail = await this.model.getClientEmail(clientId);
    if (!clientEmail) {
      console.warn("Aucun email trouvé pour le client", clientId);
      return;
    }

    await this.sendDeliveryEmail(clientEmail, deliveryId, qrCodeUrl);
  } catch (error) {
    if (retries > 0) {
      console.log(`Nouvel essai d'envoi d'email (${retries} restants)...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attente de 2s
      return this.sendDeliveryEmailWithRetry(clientId, deliveryId, qrCodeUrl, retries - 1);
    }
    throw error;
  }
}

private async sendDeliveryEmail(
  email: string, 
  deliveryId: string, 
  qrCodeUrl: string
): Promise<void> {
  try {
    // Utilisez votre adresse IP locale ou serveur
    const apiUrl = 'http://192.168.160.160:3001/send-delivery-email'; // Remplacez X par votre valeur
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, deliveryId, qrCodeUrl }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
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