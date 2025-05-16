import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../!!!!!!!!!!!!!!!!!!!!;FirebaseConfig";

export interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
  price?: number;
}

export const fetchProducts = async (): Promise<DropdownOption[]> => {
  const querySnapshot = await getDocs(collection(firebasestore, "products"));
  return querySnapshot.docs.map((doc) => ({
    label: doc.data().name,
    value: doc.id,
    image: doc.data().imageUrl,
    price: doc.data().amount,
  }));
};

export const fetchClients = async (): Promise<DropdownOption[]> => {
  const querySnapshot = await getDocs(collection(firebasestore, "clients"));
  return querySnapshot.docs.map((doc) => ({
    label: doc.data().name,
    value: doc.id,
  }));
};

export const fetchAdresses = async (): Promise<DropdownOption[]> => {
  const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
  return querySnapshot.docs.map((doc) => ({
    label: doc.data().address,
    value: doc.id,
  }));
};

export const fetchDefaultStatus = async (): Promise<string | null> => {
  try {
    const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
    return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
  } catch (error) {
    console.error("Erreur lors de la récupération du statut par défaut :", error);
    return null;
  }
};

export const saveDelivery = async (deliveryData: any): Promise<void> => {
  await setDoc(doc(firebasestore, "livraisons", deliveryData.id), deliveryData);
};

export const generateQRCode = (deliveryId: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
};