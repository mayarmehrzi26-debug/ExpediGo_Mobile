import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchEmballages = async () => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "Non traité")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp // Conserve le timestamp pour le formatage
    }));
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