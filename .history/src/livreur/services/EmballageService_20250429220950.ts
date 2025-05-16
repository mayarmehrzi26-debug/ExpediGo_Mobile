import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

interface Emballage {
  id?: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "non traité" | "en cours" | "traité";
  createdBy: string;
  addressId: string;
  createdAt: any;
}

export const fetchEmballages = async () => {
  const q = query(
    collection(firebasestore, "orders"),
    where("status", "==", "non traité")
  );
  
  const querySnapshot = await getDocs(q);
  const emballages: any[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    
    // Récupération des données utilisateur
    const userSnap = await getDoc(doc(firebasestore, "users", data.createdBy));
    const userData = userSnap.exists() ? userSnap.data() : {};
    
    // Récupération de l'adresse
    const addressSnap = await getDoc(doc(firebasestore, "adresses", data.addressId));
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    // Formatage de la date
    let formattedDate = "Date inconnue";
    if (data.timestamp instanceof Timestamp) {
      const dateObj = data.timestamp.toDate();
      formattedDate = `${dateObj.toLocaleDateString('fr-FR')} ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    emballages.push({
      id: docSnap.id,
      size: data.size || "Taille inconnue",
      quantity: data.quantity || 0,
      price: data.price || 0,
      totalPrice: data.totalPrice || 0,
      clientEmail: userData?.email || "Email inconnu",
      fullAddress: addressData?.address || "Adresse inconnue",
      date: formattedDate,
      status: data.status || "non traité"
    });
  }

  return emballages;
};

export const updateEmballageStatus = async (emballageId: string, status: "non traité" | "en cours" | "traité") => {
  const emballageRef = doc(firebasestore, "orders", emballageId);

  try {
    await updateDoc(emballageRef, { status });
    console.log(`Statut de l'emballage ${emballageId} mis à jour en ${status}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'emballage", error);
    return false;
  }
};