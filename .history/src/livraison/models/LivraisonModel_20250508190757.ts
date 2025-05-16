import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export class LivraisonModel {
  async getClientByUserId(uid: string): Promise<any> {
    try {
      // Try users collection first
      const userQuery = query(
        collection(firebasestore, "users"),
        where("uid", "==", uid)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const clientDoc = await getDoc(doc(firebasestore, "clients", userData.clientId));
        return {
          id: clientDoc.id,
          ...clientDoc.data()
        };
      }

      // Try clients collection directly
      const clientsQuery = query(
        collection(firebasestore, "clients"),
        where("uid", "==", uid)
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      if (!clientsSnapshot.empty) {
        return {
          id: clientsSnapshot.docs[0].id,
          ...clientsSnapshot.docs[0].data()
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting client:", error);
      return null;
    }
  }
  async getCommandesWithAdresses(clientId: string): Promise<any[]> {
    try {
      // 1. Récupérer les livraisons
      const livraisonsSnapshot = await getDocs(
        query(
          collection(firebasestore, "livraisons"),
          where("client", "==", clientId)
        )
      );
  
      // 2. Récupérer TOUTES les adresses en une seule requête
      const adressesSnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adressesMap = new Map<string, string>();
      
      adressesSnapshot.forEach(doc => {
        adressesMap.set(doc.id, doc.data().address); // ID => Adresse complète
      });
  
      // 3. Combiner les données
      return livraisonsSnapshot.docs.map(doc => {
        const data = doc.data();
        const fullAddress = adressesMap.get(data.address) || data.address;
        
        console.log("Conversion adresse:", {
          id: doc.id,
          addressId: data.address,
          fullAddress
        });
  
        return {
          id: doc.id,
          address: fullAddress, // Contient maintenant l'adresse complète
          status: data.status,
          createdAt: data.createdAt,
          ...data
        };
      });
  
    } catch (error) {
      console.error("Erreur getCommandesWithAdresses:", error);
      return [];
    }
  }
  
}