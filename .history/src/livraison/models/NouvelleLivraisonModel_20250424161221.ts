import { collection, getDocs } from "firebase/firestore";
import { firebasestore } from "../FirebaseConfig";
import { DropdownOption } from "../types";

export class NouvelleLivraisonModel {
  static async fetchCollection(collectionName: string): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(firebasestore, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  }

  static async fetchProducts(): Promise<DropdownOption[]> {
    const products = await this.fetchCollection("products");
    return products.map(product => ({
      label: product.name,
      value: product.id,
      image: product.imageUrl,
      price: product.amount
    }));
  }

  static async fetchClients(): Promise<DropdownOption[]> {
    const clients = await this.fetchCollection("clients");
    return clients.map(client => ({
      label: client.name,
      value: client.id
    }));
  }

  static async fetchAdresses(): Promise<DropdownOption[]> {
    const adresses = await this.fetchCollection("adresses");
    return adresses.map(adresse => ({
      label: adresse.address,
      value: adresse.id
    }));
  }

  static async fetchDefaultStatus(): Promise<string | null> {
    try {
      const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
      return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
    } catch (error) {
      console.error("Erreur lors de la récupération du statut par défaut :", error);
      return null;
    }
  }

  static async saveDelivery(deliveryData: DeliveryData): Promise<void> {
    await setDoc(doc(firebasestore, "livraisons", deliveryData.id), deliveryData);
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }
}