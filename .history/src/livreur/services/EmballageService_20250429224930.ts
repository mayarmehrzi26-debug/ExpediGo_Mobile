import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface EmballageOrder {
  id: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "non traité" | "en cours" | "traité";
  createdBy: string;
  addressId: string;
  timestamp?: any;
  userInfo?: {
    email: string;
    displayName: string;
  };
  addressInfo?: {
    fullAddress: string;
  };
  formattedDate?: string;
}

export const fetchEmballages = async (): Promise<EmballageOrder[]> => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "non traité")
    );
    const querySnapshot = await getDocs(q);
    
    const emballages: EmballageOrder[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const orderId = docSnap.id; // ID complet de la commande

      // Structure de base avec l'ID complet
      const emballage: EmballageOrder = {
        id: orderId, // Ici on utilise directement l'ID du document
        size: data.size || "Non spécifié",
        quantity: data.quantity || 0,
        price: data.price || 0,
        totalPrice: data.totalPrice || 0,
        status: data.status || "non traité",
        createdBy: data.createdBy || "",
        addressId: data.addressId || "",
        timestamp: data.timestamp,
      };

      // Récupération des données utilisateur
      if (emballage.createdBy) {
        try {
          const userDoc = await getDoc(doc(firebasestore, "users", emballage.createdBy));
          if (userDoc.exists()) {
            emballage.userInfo = {
              email: userDoc.data()?.email || "Email inconnu",
              displayName: userDoc.data()?.displayName || userDoc.data()?.name || "Utilisateur inconnu"
            };
          }
        } catch (error) {
          console.error(`Erreur récupération utilisateur ${emballage.createdBy}:`, error);
        }
      }

      // Récupération des données d'adresse
      if (emballage.addressId) {
        try {
          const addressDoc = await getDoc(doc(firebasestore, "adresses", emballage.addressId));
          if (addressDoc.exists()) {
            emballage.addressInfo = {
              fullAddress: addressDoc.data()?.address || "Adresse inconnue"
            };
          }
        } catch (error) {
          console.error(`Erreur récupération adresse ${emballage.addressId}:`, error);
        }
      }

      // Formatage de la date
      if (emballage.timestamp?.toDate) {
        try {
          emballage.formattedDate = emballage.timestamp.toDate().toLocaleString('fr-FR');
        } catch (error) {
          console.error("Erreur formatage date:", error);
          emballage.formattedDate = "Date inconnue";
        }
      }

      emballages.push(emballage);
    }
    
    return emballages;
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages:", error);
    return [];
  }
};

export const updateEmballageStatus = async (emballageId: string, status: "non traité" | "en cours" | "traité"): Promise<boolean> => {
  try {
    await updateDoc(doc(firebasestore, "orders", emballageId), { status });
    return true;
  } catch (error) {
    console.error(`Erreur mise à jour commande ${emballageId}:`, error);
    return false;
  }
};