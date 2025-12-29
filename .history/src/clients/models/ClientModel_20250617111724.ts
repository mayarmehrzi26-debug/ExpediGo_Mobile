import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  createdBy: string;
}

export interface User {
  uid: string;
  email: string;
  role: string; // 'expediteur' | 'destinataire'
  clientId?: string; // Seulement pour les destinataires
  managedClients?: string[]; // Pour les expéditeurs (optionnel)
}

export interface SenderClientRelation {
  senderId: string;
  clientId: string;
  createdAt: string;
}


export class ClientService {
   private static async clientExists(email: string): Promise<Client | null> {
    const q = query(collection(firebasestore, "clients"), where("email", "==", email));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Client;
  }

  // Crée une relation entre expéditeur et client
  private static async createSenderClientRelation(senderId: string, clientId: string): Promise<void> {
    await addDoc(collection(firebasestore, "senderClientRelations"), {
      senderId,
      clientId,
      createdAt: new Date().toISOString()
    });
  }

 static async addClient(client: Omit<Client, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(firebasestore, "clients"), client);
      return docRef.id;
    } catch (error) {
      console.error("Error adding client:", error);
      throw new Error("Erreur lors de l'ajout du client");
    }
  }
// Ajoute un client avec vérification d'existence
  static async addClientWithEmail(
    client: Omit<Client, "id">,
    password: string
  ): Promise<{ id: string, isNew: boolean }> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error("Utilisateur non connecté");

    // Vérifier si le client existe déjà
    const existingClient = await this.clientExists(client.email);
    
    if (existingClient) {
      // Créer seulement la relation si le client existe déjà
      await this.createSenderClientRelation(currentUser.uid, existingClient.id);
      return { id: existingClient.id, isNew: false };
    }

    // Si nouveau client, envoyer l'email et créer le client
    const backendUrls = ['http://192.168.117.160:3001'];
    let emailSent = false;

    for (const url of backendUrls) {
      try {
        const response = await fetch(`${url}/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: client.email,
            name: client.name,
            password,
            address: client.address
          })
        });
        
        if (response.ok) {
          emailSent = true;
          break;
        }
      } catch (error) {
        console.warn(`Échec avec ${url}:`, error);
      }
    }

    if (!emailSent) {
      throw new Error("Impossible d'envoyer l'email de bienvenue");
    }

    // Créer le nouveau client
    const docRef = await addDoc(collection(firebasestore, "clients"), {
      ...client,
      createdAt: new Date().toISOString()
    });

    // Créer la relation expéditeur-client
    await this.createSenderClientRelation(currentUser.uid, docRef.id);

    return { id: docRef.id, isNew: true };
  }

 static async createUserAccount(
    email: string,
    password: string,
    clientId: string
  ): Promise<User> {
    const currentUser = firebaseAuth.currentUser;
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    const userData: User = {
      uid: user.uid,
      email,
      role: "destinataire",
      clientId
    };

    await setDoc(doc(firebasestore, "users", user.uid), userData);
    await sendEmailVerification(user);

    // Reconnecter l'utilisateur original si nécessaire
    if (currentUser) await firebaseAuth.updateCurrentUser(currentUser);

    return userData;
  }
  static async getClients(): Promise<Client[]> {
    try {
      const q = query(collection(firebasestore, "clients"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      console.error("Error getting clients:", error);
      throw new Error("Erreur lors de la récupération des clients");
    }
  }

  static async getClientById(clientId: string): Promise<Client | null> {
    try {
      const docRef = doc(firebasestore, "clients", clientId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Client;
    } catch (error) {
      console.error("Error getting client:", error);
      throw new Error("Erreur lors de la récupération du client");
    }
  }
static async updateClient(clientId: string, clientData: Partial<Client>): Promise<void> {
  try {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    const clientRef = doc(firebasestore, "clients", clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      throw new Error("Client non trouvé");
    }
    
    const client = clientDoc.data() as Client;
    if (client.createdBy !== currentUser.uid) {
      throw new Error("Vous n'êtes pas autorisé à modifier ce client");
    }

    await updateDoc(clientRef, clientData);
  } catch (error) {
    console.error("Error updating client:", error);
    throw error; // On propage l'erreur originale
  }
}

static async deleteClient(clientId: string): Promise<void> {
  try {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    const clientRef = doc(firebasestore, "clients", clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      throw new Error("Client non trouvé");
    }
    
    const client = clientDoc.data() as Client;
    if (client.createdBy !== currentUser.uid) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce client");
    }

    await deleteDoc(clientRef);
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error; // On propage l'erreur originale
  }
}
static async getClientsByCurrentUser(): Promise<Client[]> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error("Utilisateur non connecté");

    // Récupérer les relations de l'expéditeur
    const relationsQuery = query(
      collection(firebasestore, "senderClientRelations"),
      where("senderId", "==", currentUser.uid)
    );
    
    const relations = await getDocs(relationsQuery);
    if (relations.empty) return [];

    // Récupérer les clients correspondants
    const clientIds = relations.docs.map(doc => doc.data().clientId);
    const clientsQuery = query(
      collection(firebasestore, "clients"),
      where("__name__", "in", clientIds)
    );

    const clientsSnapshot = await getDocs(clientsQuery);
    return clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  }
static async updateUserClientId(userId: string, clientId: string): Promise<void> {
  try {
    const userRef = doc(firebasestore, "users", userId);
    await updateDoc(userRef, { clientId });
  } catch (error) {
    console.error("Error updating user with clientId:", error);
    throw new Error("Erreur lors de la mise à jour de l'utilisateur");
  }
}
}