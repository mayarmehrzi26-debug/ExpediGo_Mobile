import { collection, doc, getDocs,getDoc setDoc } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";
import { DropdownOption } from "../types";

export class LivraisonModel {
  // Retirez 'static' pour les méthodes d'instance
  async fetchProducts(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map(doc => ({
      label: doc.data().name,
      value: doc.id,
      image: doc.data().imageUrl,
      price: doc.data().amount
    }));
  }

  async fetchClients(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "clients"));
    return querySnapshot.docs.map(doc => ({
      label: doc.data().name,
      value: doc.id
    }));
  }

  async fetchAdresses(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
    return querySnapshot.docs.map(doc => ({
      label: doc.data().address,
      value: doc.id
    }));
  }

  async fetchDefaultStatus(): Promise<string | null> {
    try {
      const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
      return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
    } catch (error) {
      console.error("Erreur lors de la récupération du statut :", error);
      return null;
    }
  }

  // Gardez saveDelivery et generateQRCode comme méthodes statiques si nécessaire
  async saveDelivery(deliveryData: any): Promise<void> {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }
    
    const deliveryWithUser = {
      ...deliveryData,
      createdBy: user.uid, // Ajoute l'ID de l'utilisateur
      createdAt: new Date() // Ajoute la date de création
    };

    await setDoc(doc(firebasestore, "livraisons", deliveryData.id), deliveryWithUser);
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }
  async fetchInitialData() {
    try {
      const [products, clients, adresses, defaultStatus] = await Promise.all([
        this.fetchProducts(),
        this.fetchClients(),
        this.fetchAdresses(),
        this.fetchDefaultStatus(),
      ]);
  
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
  async getClientEmail(clientId: string): Promise<string | null> {
  try {
    const clientDoc = await getDoc(doc(firebasestore, "clients", clientId));
    return clientDoc.exists() ? clientDoc.data().email : null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'email du client:", error);
    return null;
  }
}
}
