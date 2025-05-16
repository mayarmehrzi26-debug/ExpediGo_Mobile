import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchEmballages = async () => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "non traité")
    );
    const querySnapshot = await getDocs(q);
    
    const emballages = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Récupérer les données utilisateur
      let userData = {};
      try {
        const userDoc = await getDoc(doc(firebasestore, "users", data.createdBy));
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }
      
      // Récupérer les données d'adresse
      let addressData = {};
      try {
        const addressDoc = await getDoc(doc(firebasestore, "adresses", data.addressId));
        if (addressDoc.exists()) {
          addressData = addressDoc.data();
        }
      } catch (error) {
        console.error("Erreur récupération adresse:", error);
      }
      
      emballages.push({
        id: docSnap.id,
        ...data,
        userInfo: {
          email: userData.email || "Email inconnu",
          displayName: userData.displayName || "Utilisateur inconnu"
        },
        addressInfo: {
          fullAddress: addressData.address || "Adresse inconnue",
          // Ajoutez d'autres champs d'adresse si nécessaire
        },
        timestamp: data.timestamp // Conserve le timestamp pour le formatage
      });
    }
    
    return emballages;
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