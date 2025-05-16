import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
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
  async getClientById(clientId: string): Promise<any> {
    try {
      const docRef = doc(firebasestore, "clients", clientId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error getting client:", error);
      return null;
    }
  }
  
  async getCommandeById(commandeId: string): Promise<any> {
    try {
      const docRef = doc(firebasestore, "livraisons", commandeId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
  
      const data = docSnap.data();
      const addressDoc = data.address 
        ? await getDoc(doc(firebasestore, "adresses", data.address))
        : null;
  
      return {
        id: docSnap.id,
        ...data,
        clientId: data.client, // Assurez-vous que ce champ est bien présent
        originAddress: addressDoc?.exists() ? addressDoc.data().address : "Adresse inconnue",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        assignedTo: data.assignedTo,
      };
    } catch (error) {
      console.error("Error getting commande:", error);
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
  async getUserById(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }
  async getProductById(productId: string): Promise<any> {
    try {
      const productDoc = await getDoc(doc(firebasestore, "products", productId));
      return productDoc.exists() ? productDoc.data() : null;
    } catch (error) {
      console.error("Error getting product:", error);
      return null;
    }
  }
  async createConversation(participants: string[]): Promise<string> {
    try {
      const docRef = await addDoc(collection(firebasestore, "conversations"), {
        participants,
        lastMessage: "",
        lastMessageAt: new Date(),
        createdBy: participants[0],
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }
  
  async sendMessage(conversationId: string, message: {
    text: string;
    sender: string;
  }): Promise<void> {
    try {
      // Ajouter le message à la sous-collection
      await addDoc(collection(firebasestore, "conversations", conversationId, "messages"), {
        ...message,
        createdAt: new Date(),
        read: false
      });
      
      // Mettre à jour la conversation
      await updateDoc(doc(firebasestore, "conversations", conversationId), {
        lastMessage: message.text,
        lastMessageAt: new Date()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
  
  async getConversations(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(firebasestore, "conversations"),
        where("participants", "array-contains", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  }
  
  async getMessages(conversationId: string): Promise<any[]> {
    try {
      const q = query(
        collection(firebasestore, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }
}