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
      // 1. Get deliveries
      const livraisonsSnapshot = await getDocs(
        query(collection(firebasestore, "livraisons"), where("client", "==", clientId))
      );
  
      // 2. Get ALL addresses upfront (optimized)
      const adressesSnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adressesMap = new Map<string, string>(
        adressesSnapshot.docs.map(doc => [doc.id, doc.data().address])
      );
  
      // 3. Debug: Log the address map
      console.log("Map des adresses:", Array.from(adressesMap.entries()));
  
      return livraisonsSnapshot.docs.map(doc => {
        const data = doc.data();
        const addressId = data.address;
        const fullAddress = adressesMap.get(addressId) || `[ID non trouvé: ${addressId}]`;
  
        // Debug: Log each conversion
        console.log(`Conversion: ${addressId} → ${fullAddress}`);
  
        return {
          id: doc.id,
          address: fullAddress, // Force l'utilisation de l'adresse textuelle
          ...data
        };
      });
  
    } catch (error) {
      console.error("Erreur critique:", error);
      return [];
    }
  }
}