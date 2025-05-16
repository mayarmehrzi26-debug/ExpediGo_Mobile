import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../../../FirebaseConfig";
import { Client,Livraison, Produit } from "../";

export class FirebaseService {
  static async fetchProducts(): Promise<Produit[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      imageUrl: doc.data().imageUrl,
      amount: doc.data().amount,
    }));
  }

  static async fetchClients(): Promise<Client[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "clients"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  }

  static async fetchAdresses(): Promise<string[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
    return querySnapshot.docs.map((doc) => doc.data().address);
  }

  static async fetchDefaultStatus(): Promise<string | null> {
    const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
    return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
  }

  static async saveLivraison(livraison: Livraison): Promise<void> {
    await setDoc(doc(firebasestore, "livraisons", livraison.id), livraison);
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }
}