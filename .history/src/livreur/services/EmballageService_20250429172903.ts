import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchEmballages = async () => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "Non traité")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        size: data.size,
        quantity: data.quantity,
        price: data.price,
        totalPrice: data.totalPrice,
        status: data.status || "non traité",
        date: data.timestamp?.toDate?.()?.toLocaleString() || "Date inconnue",
        destination: data.destination || "Adresse inconnue",
        clientEmail: data.clientEmail || "Email inconnu"
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages:", error);
    return [];
  }
};

export const updateEmballageStatus = async (emballageId: string, status: "non traité" | "en cours" | "traité") => {
  try {
    await updateDoc(doc(firebasestore, "orders", emballageId), { status });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emballage:", error);
    return false;
  }
};