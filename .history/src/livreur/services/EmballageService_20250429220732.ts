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
    
    for (const docSnapshot of querySnapshot.docs) {
      const orderData = docSnapshot.data();
      
      // Récupérer l'email de l'utilisateur
      let userEmail = "Inconnu";
      try {
        const userDoc = await getDoc(doc(firebasestore, "users", orderData.createdBy));
        if (userDoc.exists()) {
          userEmail = userDoc.data().email || userDoc.data().displayName || "Utilisateur inconnu";
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }
      
      // Récupérer l'adresse (seulement le champ address)
      let addressText = "Adresse inconnue";
      try {
        const addressDoc = await getDoc(doc(firebasestore, "adresses", orderData.addressId));
        if (addressDoc.exists()) {
          addressText = addressDoc.data().address || "Adresse non spécifiée";
        }
      } catch (error) {
        console.error("Erreur récupération adresse:", error);
      }
      
      emballages.push({
        id: docSnapshot.id,
        ...orderData,
        clientEmail: userEmail,
        fullAddress: addressText, // Juste le texte de l'adresse
        timestamp: orderData.timestamp?.toDate() || null
      });
    }
    
    return emballages;
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages:", error);
    return [];
  }
};
export const updateEmballageStatus = async (emballageId: string, status: "Non traité" | "en cours" | "traité") => {
  try {
    await updateDoc(doc(firebasestore, "orders", emballageId), { status });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emballage:", error);
    return false;
  }
};