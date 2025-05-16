import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

interface Commande {
  id: string;
  origin: string;
  destination: string;
  date: string;
  status: string;
  clientEmail: string;
  type: "emballage" | "livraison";
}

// 🔹 Récupère les commandes d'emballage depuis la collection "orders"
export const fetchCommandesEmballage = async (): Promise<Commande[]> => {
  const commandes: Commande[] = [];

  const q = query(collection(firebasestore, "orders"), where("status", "==", "non traité"));
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const clientSnap = await getDoc(doc(firebasestore, "clients", data.client));
    const addressSnap = await getDoc(doc(firebasestore, "adresses", data.address));

    const clientData = clientSnap.exists() ? clientSnap.data() : {};
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    const formattedDate = formatDate(data.createdAt, data.date);

    commandes.push({
      id: docSnap.id,
      origin: addressData?.address || "origine inconnue",
      destination: clientData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "En attente",
      clientEmail: clientData?.email || "",
      type: "emballage",
    });
  }

  return commandes;
};

// 🔹 Récupère les livraisons depuis la collection "livraisons"
export const fetchCommandesLivraison = async (): Promise<Commande[]> => {
  const commandes: Commande[] = [];

  const q = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const clientSnap = await getDoc(doc(firebasestore, "clients", data.client));
    const addressSnap = await getDoc(doc(firebasestore, "adresses", data.address));

    const clientData = clientSnap.exists() ? clientSnap.data() : {};
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    const formattedDate = formatDate(data.createdAt, data.date);

    commandes.push({
      id: docSnap.id,
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "En attente",
      clientEmail: clientData?.email || "",
      type: "livraison",
    });
  }

  return commandes;
};

// 🔹 Combine les deux types si nécessaire
export const fetchToutesLesCommandes = async (): Promise<Commande[]> => {
  const [emballages, livraisons] = await Promise.all([
    fetchCommandesEmballage(),
    fetchCommandesLivraison(),
  ]);

  return [...emballages, ...livraisons];
};

// 🔹 Met à jour une commande d’emballage (orders)
export const updateOrderStatus = async (orderId: string, status: string) => {
  const orderRef = doc(firebasestore, "orders", orderId);

  try {
    await updateDoc(orderRef, { status });
    console.log(`Statut de l'emballage ${orderId} mis à jour en ${status}`);
  } catch (error) {
    console.error("Erreur mise à jour status emballage :", error);
  }
};

// 🔹 Met à jour une commande de livraison
export const updateCommandeStatus = async (orderId: string, status: string) => {
  const orderRef = doc(firebasestore, "livraisons", orderId);

  try {
    await updateDoc(orderRef, { status });
    console.log(`Statut de la livraison ${orderId} mis à jour en ${status}`);
  } catch (error) {
    console.error("Erreur mise à jour status livraison :", error);
  }
};

// 🔹 Formatage centralisé de date
const formatDate = (createdAt: any, fallbackDate?: string): string => {
  if (createdAt instanceof Timestamp) {
    const dateObj = createdAt.toDate();
    return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return fallbackDate || "Date inconnue";
};
