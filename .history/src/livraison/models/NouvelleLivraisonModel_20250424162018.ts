import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
import { DropdownOption } from "../types";

export class NouvelleLivraisonModel {
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
  static async saveDelivery(deliveryData: any): Promise<void> {
    await setDoc(doc(firebasestore, "livraisons", deliveryData.id), deliveryData);
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }
}