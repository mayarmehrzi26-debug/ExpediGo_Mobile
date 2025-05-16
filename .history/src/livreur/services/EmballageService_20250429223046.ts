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
      
      // Récupération des données utilisateur avec sécurité
      let userEmail = "Email inconnu";
      let displayName = "Utilisateur inconnu";
      try {
        if (data.createdBy) {
          const userDoc = await getDoc(doc(firebasestore, "users", data.createdBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userEmail = userData?.email || userEmail;
            nam = userData?.displayName || displayName;
          }
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }
      
      // Récupération des données d'adresse avec sécurité
      let fullAddress = "Adresse inconnue";
      try {
        if (data.addressId) {
          const addressDoc = await getDoc(doc(firebasestore, "adresses", data.addressId));
          if (addressDoc.exists()) {
            const addressData = addressDoc.data();
            fullAddress = addressData?.address || fullAddress;
          }
        }
      } catch (error) {
        console.error("Erreur récupération adresse:", error);
      }
      
      // Formatage de la date
      let formattedDate = "Date inconnue";
      try {
        if (data.timestamp?.toDate) {
          const dateObj = data.timestamp.toDate();
          formattedDate = dateObj.toLocaleString('fr-FR');
        }
      } catch (error) {
        console.error("Erreur formatage date:", error);
      }
      
      emballages.push({
        id: docSnap.id,
        ...data,
        userInfo: {
          email: userEmail,
          displayName: displayName
        },
        addressInfo: {
          fullAddress: fullAddress
        },
        formattedDate: formattedDate
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