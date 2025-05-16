import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
import { DeliveryData, DropdownOption } from "../contracts/NouvelleLivraisonContracts";

export class NouvelleLivraisonService {
  static async fetchProducts(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map((doc) => ({
      label: doc.data().name,
      value: doc.id,
      image: doc.data().imageUrl,
      price: doc.data().amount,
    }));
  }

  static async fetchClients(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "clients"));
    return querySnapshot.docs.map((doc) => ({
      label: doc.data().name,
      value: doc.id,
    }));
  }

  static async fetchAddresses(): Promise<DropdownOption[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "addresses"));
    return querySnapshot.docs.map((doc) => ({
      label: doc.data().address,
      value: doc.id,
    }));
  }

  static async fetchDefaultStatus(): Promise<string | null> {
    const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
    return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
  }

  static async saveDelivery(deliveryData: DeliveryData): Promise<void> {
    await setDoc(doc(firebasestore, "deliveries", deliveryData.id), deliveryData);
  }

  static generateQRCode(deliveryId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  }
}