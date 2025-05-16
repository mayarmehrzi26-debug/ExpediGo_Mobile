import { addDoc, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
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
      // Vérification des participants
      if (!participants || participants.length !== 2) {
        throw new Error("Une conversation nécessite exactement 2 participants");
      }
  
      // Vérification que les utilisateurs existent
      for (const userId of participants) {
        const exists = await this.userExists(userId);
        if (!exists) {
          throw new Error(`L'utilisateur ${userId} n'existe pas`);
        }
      }
  
      const conversationData = {
        participants,
        lastMessage: "",
        lastMessageAt: new Date(),
        createdBy: participants[0],
        createdAt: new Date(),
        status: "active",
        participantNames: {} // Vous pouvez ajouter les noms ici si nécessaire
      };
  
      const docRef = await addDoc(collection(firebasestore, "conversations"), conversationData);
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
  async findExistingConversation(participants: string[]): Promise<string | null> {
    try {
      if (!participants || participants.length !== 2) {
        console.error("Participants invalides");
        return null;
      }
  
      // Vérifiez que les deux participants existent
      const [user1, user2] = participants;
      const user1Exists = await this.userExists(user1);
      const user2Exists = await this.userExists(user2);
  
      if (!user1Exists || !user2Exists) {
        console.error("Un ou plusieurs participants n'existent pas");
        return null;
      }
  
      // Recherchez une conversation existante
      const q = query(
        collection(firebasestore, "conversations"),
        where("participants", "array-contains", user1)
      );
      
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(user2)) {
          return doc.id;
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding conversation:", error);
      return null;
    }
  }
  
  async userExists(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }
  async incrementClientReturns(clientId: string): Promise<void> {
    try {
      const clientRef = doc(firebasestore, "clients", clientId);
      await updateDoc(clientRef, {
        total_returns: increment(1)
      });
      console.log("Compteur de retours incrémenté pour le client:", clientId);
    } catch (error) {
      console.error("Erreur lors de l'incrémentation du compteur:", error);
      throw error;
    }
  }
  async getDestinataireByCommandeId(commandeId: string): Promise<any> {
    try {
      const commandeDoc = await getDoc(doc(firebasestore, "livraisons", commandeId));
      if (!commandeDoc.exists()) return null;
  
      const commandeData = commandeDoc.data();
      
      // 1. Si le client est une référence
      if (commandeData.client?.path) {
        const clientDoc = await getDoc(doc(firebasestore, commandeData.client.path));
        if (clientDoc.exists()) return { id: clientDoc.id, ...clientDoc.data() };
      }
      
      // 2. Si c'est un ID string (comme dans votre image)
      if (typeof commandeData.client === 'string') {
        // Nettoyer l'ID si nécessaire (enlever les caractères invalides)
        const cleanId = commandeData.client.replace(':', '');
        
        // Chercher dans users avec le rôle "destinataire"
        const userQuery = query(
          collection(firebasestore, "users"),
          where("clientId", "==", cleanId),
          where("role", "==", "destinataire"),
          limit(1)
        );
        
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() };
        }
      }
  
      return null;
    } catch (error) {
      console.error("Error getting destinataire:", error);
      return null;
    }
  }
  async checkUserExists(userId: string): Promise<boolean> {
    try {
      // Vérifie d'abord dans la collection users
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      if (userDoc.exists()) return true;
      
      // Si pas trouvé, vérifie dans la collection clients
      const clientDoc = await getDoc(doc(firebasestore, "clients", userId));
      return clientDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }
}