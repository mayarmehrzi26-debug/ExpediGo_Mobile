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
      const livraisonsSnapshot = await getDocs(
        query(collection(firebasestore, "livraisons"), where("client", "==", clientId))
      );
  
      const adressesSnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adressesMap = new Map<string, any>(
        adressesSnapshot.docs.map(doc => [doc.id, doc.data()])
      );
  
      return livraisonsSnapshot.docs.map(doc => {
        const data = doc.data();
        const addressId = data.address;
        const addressData = adressesMap.get(addressId) || { address: `Adresse inconnue (ID: ${addressId})` };
  
        return {
          id: doc.id,
          originAddress: addressData.address, // Adresse complète de l'origine
          ...data
        };
      });
  
    } catch (error) {
      console.error("Erreur critique:", error);
      return [];
    }
  }
}