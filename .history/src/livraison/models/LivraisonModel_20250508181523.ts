import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { firebasestore } from "../../FirebaseConfig";

export interface Commande {
  id: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  clientName: string;
  clientPhone: string;
}

export class LivraisonModel {
  async getClientByUserId(uid: string) {
    try {
      // Essai 1: Chercher dans la collection users
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

      // Essai 2: Chercher directement dans clients
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
      console.error("Error in getClientByUserId:", error);
      return null;
    }
  }

  async getCommandesByClient(clientId: string) {
    try {
      const commandesQuery = query(
        collection(firebasestore, "livraisons"),
        where("client", "==", clientId)
      );
      
      const snapshot = await getDocs(commandesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error in getCommandesByClient:", error);
      return [];
    }
  }

  async getAdressesMap() {
    try {
      const snapshot = await getDocs(collection(firebasestore, "adresses"));
      const map = new Map();
      snapshot.forEach(doc => {
        map.set(doc.id, doc.data());
      });
      return map;
    } catch (error) {
      console.error("Error in getAdressesMap:", error);
      return new Map();
    }
  }
}