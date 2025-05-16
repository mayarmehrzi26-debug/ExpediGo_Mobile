import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

interface Emballage {
  id?: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "Non traité" | "en cours" | "traité";
  timestamp: any;
  client: string;
}

export const fetchEmballages = async (): Promise<Emballage[]> => {
  const q = query(collection(firebasestore, "orders"), where("status", "==", "non traité"));
  const querySnapshot = await getDocs(q);
  
  const emballages: Emballage[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const clientSnap = await getDoc(doc(firebasestore, "clients", data.client));
    const clientData = clientSnap.exists() ? clientSnap.data() : {};

    let formattedDate = "Date inconnue";
    if (data.timestamp instanceof Timestamp) {
      const dateObj = data.timestamp.toDate();
      formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    emballages.push({
      id: docSnap.id,
      size: data.size,
      quantity: data.quantity,
      price: data.price,
      totalPrice: data.totalPrice,
      status: data.status || "non traité",
      timestamp: data.timestamp,
      client: data.client,
      // Pour l'affichage dans la carte
      date: formattedDate,
      destination: clientData?.address || "Adresse inconnue",
      clientEmail: clientData?.email || ""
    });
  }

  return emballages;
};

export const updateEmballageStatus = async (emballageId: string, status: "non traité" | "en cours" | "traité") => {
  const emballageRef = doc(firebasestore, "emballages", emballageId);

  try {
    await updateDoc(emballageRef, { status });
    console.log(`Statut de l'emballage ${emballageId} mis à jour en ${status}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'emballage", error);
    return false;
  }
};