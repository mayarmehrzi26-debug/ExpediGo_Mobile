import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
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
  
      // Si createdBy est une string, on la conserve telle quelle
      // Si c'est une référence, on pourrait la résoudre ici
      return {
        id: docSnap.id,
        ...data,
        createdBy: data.createdBy, // Peut être string ou objet
        clientId: data.client,
        originAddress: addressDoc?.exists() ? addressDoc.data().address : "Adresse inconnue",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        assignedTo: data.assignedTo,
        totalAmount: data.totalAmount || data.montant || 0
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
    if (!productId) {
      throw new Error("ID produit requis");
    }

    const productDoc = await getDoc(doc(firebasestore, "products", productId));
    if (!productDoc.exists()) {
      console.warn(`Produit ${productId} non trouvé`);
      return null;
    }

    const data = productDoc.data();
    return {
      id: productDoc.id,
      name: data.name || 'Produit sans nom',
      description: data.description || '',
      price: data.price || data.amount || 0,
      imageUrl: data.imageUrl || data.image || null
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
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
 async creditExpediteur(expediteurId: string, montant: number, commandeId: string): Promise<void> {
    try {
        console.log(`Tentative de crédit: ${montant}dt pour ${expediteurId} (commande ${commandeId})`);

        // Validation renforcée
        if (!expediteurId || typeof expediteurId !== 'string') {
            throw new Error("ID expéditeur invalide");
        }
        
        if (typeof montant !== 'number' || montant <= 0) {
            throw new Error(`Montant invalide: ${montant}`);
        }

        if (!commandeId) {
            throw new Error("ID commande requis");
        }

        // Récupérer les informations de la commande pour obtenir le clientId
        const commande = await this.getCommandeById(commandeId);
        if (!commande) {
            throw new Error("Commande non trouvée");
        }

        // Récupérer les informations du client
        let clientName = "Client inconnu";
        if (commande.clientId) {
            const client = await this.getClientById(commande.clientId);
            if (client) {
                clientName = client.name || client.fullName || "Client inconnu";
            }
        }

        const batch = writeBatch(firebasestore);
        const soldeRef = doc(firebasestore, "soldes", expediteurId);
        const transactionRef = doc(collection(firebasestore, "transactions"));

        // Vérification que l'utilisateur existe
        const userExists = await this.checkUserExists(expediteurId);
        if (!userExists) {
            throw new Error(`L'utilisateur ${expediteurId} n'existe pas`);
        }

        // Récupération du solde actuel
        const soldeSnap = await getDoc(soldeRef);
        const soldeData = soldeSnap.exists() ? soldeSnap.data() : null;

        console.log('Solde actuel:', soldeData);

        // Mise à jour du solde
        if (soldeSnap.exists()) {
            batch.update(soldeRef, {
                soldeEnAttente: increment(montant),
                lastUpdated: serverTimestamp()
            });
        } else {
            batch.set(soldeRef, {
                userId: expediteurId,
                soldeDisponible: 0,
                soldeEnAttente: montant,
                lastUpdated: serverTimestamp()
            });
        }

        // Création de la transaction avec le nom du client
        batch.set(transactionRef, {
            userId: expediteurId,
            commandeId: commandeId,
            clientId: commande.clientId, // Ajout de l'ID client
            clientName: clientName,      // Ajout du nom du client
            amount: montant,
            type: "livraison",
            status: "Non traité",
            description: `Crédit pour livraison ${commandeId}`,
            customerName: clientName,    // Alternative si vous préférez ce nom de champ
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Exécution du batch
        await batch.commit();
        console.log('Crédit effectué avec succès');

    } catch (error) {
        console.error("Échec du crédit:", error);
        throw new Error(`Échec du crédit: ${error.message}`);
    }
}
  async updatePaymentStatus(commandeId: string, status: string): Promise<void> {
    try {
      const commandeRef = doc(firebasestore, "livraisons", commandeId);
      await updateDoc(commandeRef, {
        paiement: status,
        paymentUpdatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }
  async getSolde(userId: string): Promise<{disponible: number, enAttente: number}> {
    try {
      const soldeDoc = await getDoc(doc(firebasestore, "soldes", userId));
      if (!soldeDoc.exists()) {
        return { disponible: 0, enAttente: 0 };
      }
      const data = soldeDoc.data();
      return {
        disponible: data.soldeDisponible || 0,
        enAttente: data.soldeEnAttente || 0
      };
    } catch (error) {
      console.error("Error getting solde:", error);
      return { disponible: 0, enAttente: 0 };
    }
  }
  
  async transfererSoldeEnAttente(userId: string): Promise<void> {
    try {
      const soldeRef = doc(firebasestore, "soldes", userId);
      const soldeDoc = await getDoc(soldeRef);
      
      if (!soldeDoc.exists()) {
        throw new Error("Aucun solde trouvé pour cet utilisateur");
      }
  
      const data = soldeDoc.data();
      const soldeEnAttente = data.soldeEnAttente || 0;
  
      if (soldeEnAttente <= 0) {
        throw new Error("Aucun solde en attente à transférer");
      }
  
      await updateDoc(soldeRef, {
        soldeDisponible: increment(soldeEnAttente),
        soldeEnAttente: 0,
        lastUpdated: serverTimestamp()
      });
  
    } catch (error) {
      console.error("Error transferring solde:", error);
      throw error;
    }
  }
  async updateLivreurPosition(livreurId: string, position: {
    latitude: number;
    longitude: number;
    commandeId?: string;
    status?: string;
  }): Promise<void> {
    try {
      const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
      await updateDoc(livreurLocationRef, {
        ...position,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position du livreur:", error);
      throw error;
    }
  }
  async getLivreurPosition(livreurId: string): Promise<{
    latitude: number;
    longitude: number;
    timestamp: Date;
    commandeId?: string;
    status?: string;
  } | null> {
    try {
      const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
      const docSnap = await getDoc(livreurLocationRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp?.toDate() || new Date(),
        commandeId: data.commandeId,
        status: data.status
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la position du livreur:", error);
      return null;
    }
  }
  listenToLivreurPosition(
    livreurId: string,
    callback: (position: {
      latitude: number;
      longitude: number;
      timestamp: Date;
      commandeId?: string;
      status?: string;
    } | null) => void
  ): () => void {
    const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
    
    // Créer le document avec des valeurs par défaut s'il n'existe pas
    setDoc(livreurLocationRef, {
      latitude: 0,
      longitude: 0,
      status: 'inactive',
      timestamp: serverTimestamp()
    }, { merge: true }).catch(error => {
      console.error("Erreur lors de la création du document livreur:", error);
    });
  
    const unsubscribe = onSnapshot(livreurLocationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("Position du livreur reçue:", data);
        callback({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp?.toDate() || new Date(),
          commandeId: data.commandeId,
          status: data.status
        });
      } else {
        console.log("Document non trouvé, tentative de recréation...");
        // Tentative de recréation du document
        setDoc(livreurLocationRef, {
          latitude: 0,
          longitude: 0,
          status: 'inactive',
          timestamp: serverTimestamp()
        }, { merge: true }).then(() => {
          console.log("Document recréé avec succès");
        }).catch(error => {
          console.error("Échec de la recréation du document:", error);
        });
        callback(null);
      }
    });
  
    return unsubscribe;
  }
async updateOrCreateLivreurPosition(
  livreurId: string, 
  position: {
    latitude: number;
    longitude: number;
    commandeId?: string;
    status?: string;
    livreurName?: string;
    assignedTo?: string;
  }
): Promise<void> {
  try {
    if (!livreurId) {
      throw new Error("Livreur ID is required");
    }
    
    const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
    
    await setDoc(livreurLocationRef, {
      ...position,
      timestamp: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      assignedTo: livreurId
    }, { merge: true });
  } catch (error) {
    console.error("Error updating livreur position:", error);
    throw new Error(`Failed to update livreur position: ${error.message}`);
  }
}
async createExchangeRequest(
    commandeId: string,
    productId: string,
    description: string,
    userId: string,
    productName: string
  ): Promise<void> {
    try {
      console.log(`Création échange - Commande: ${commandeId}, Produit: ${productId}`);

      // Validation des entrées
      if (!commandeId || !productId || !description || !userId || !productName) {
        throw new Error("Tous les champs sont requis");
      }

      const commande = await this.getCommandeById(commandeId);
      if (!commande) {
        throw new Error("Commande non trouvée");
      }

      // Préparation des données avec des valeurs par défaut
      const exchangeData = {
        commandeId,
        productId,
        productName: productName || 'Produit sans nom',
        description,
        status: "En attente",
        requestedBy: userId,
        expediteurId: commande.createdBy,
        clientId: commande.clientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log("Enregistrement de l'échange:", exchangeData);
      await addDoc(collection(firebasestore, "exchanges"), exchangeData);
      console.log("Demande d'échange créée avec succès");

    } catch (error) {
      console.error("Erreur détaillée lors de la création de la demande d'échange:", error);
      throw error;
    }
  }
async getExchangesForUser(userId: string): Promise<any[]> {
  try {
    const q = query(
      collection(firebasestore, "exchanges"),
      where("requestedBy", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting exchanges:", error);
    return [];
  }
}
async getExchangesForCommande(commandeId: string): Promise<any[]> {
  try {
    const q = query(
      collection(firebasestore, "exchanges"),
      where("commandeId", "==", commandeId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting exchanges:", error);
    return [];
  }
}
} 
