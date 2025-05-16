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
      const livraisonsQuery = query(
        collection(firebasestore, "livraisons"),
        where("client", "==", clientId)
      );
      const livraisonsSnapshot = await getDocs(livraisonsQuery);
  
      // 2. Récupérer toutes les adresses nécessaires
      const adresseIds = livraisonsSnapshot.docs
        .map(doc => doc.data().address)
        .filter((addr, index, self) => addr && self.indexOf(addr) === index);
  
      const adressesPromises = adresseIds.map(async addrId => {
        const addrDoc = await getDoc(doc(firebasestore, "adresses", addrId));
        return {
          id: addrId,
          ...addrDoc.data()
        };
      });
  
      const adresses = await Promise.all(adressesPromises);
      const adressesMap = new Map(adresses.map(addr => [addr.id, addr]));
  
      // 3. Combiner les données
      return livraisonsSnapshot.docs.map(doc => {
        const data = doc.data();
        const addressData = adressesMap.get(data.address);
        
        return {
          id: doc.id,
          address: addressData?.address || "Adresse inconnue", // Nom complet de l'adresse
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
  async getAdressesMap(): Promise<Map<string, any>> {
    try {
      const snapshot = await getDocs(collection(firebasestore, "adresses"));
      const map = new Map<string, any>();
      snapshot.forEach(doc => {
        map.set(doc.id, doc.data());
      });
      return map;
    } catch (error) {
      console.error("Error getting adresses:", error);
      return new Map();
    }
  }
}