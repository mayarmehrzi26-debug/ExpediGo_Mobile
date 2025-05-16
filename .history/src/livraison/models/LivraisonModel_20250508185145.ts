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
  async getCommandesByClient(clientId: string): Promise<any[]> {
    const snapshot = await getDocs(query(
      collection(firebasestore, "livraisons"),
      where("client", "==", clientId)
    ));
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      address: doc.data().address, // Champ address directement
      status: doc.data().status,
      createdAt: doc.data().createdAt,
      ...doc.data()
    }));
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