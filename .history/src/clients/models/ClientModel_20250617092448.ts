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
  role: string;
  clientId?: string;
}

export class ClientService {
  private static async createUserWithoutSignOut(email: string, password: string, clientId: string): Promise<User> {
    try {
      // Sauvegarder l'utilisateur actuel
      const currentUser = firebaseAuth.currentUser;
      const currentAuth = firebaseAuth;

      // Créer le nouvel utilisateur
      const userCredential = await createUserWithEmailAndPassword(currentAuth, email, password);
      const user = userCredential.user;

      // Recréer la session de l'utilisateur original si nécessaire
      if (currentUser) {
        await firebaseAuth.updateCurrentUser(currentUser);
      }

      const userData = {
        uid: user.uid,
        email,
        role: "destinataire",
        clientId
      };

      await setDoc(doc(firebasestore, "users", user.uid), userData);
      await sendEmailVerification(user);

      return userData;
    } catch (error) {
      console.error("Error creating user account:", error);
      throw new Error("Erreur lors de la création du compte utilisateur");
    }
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
  static async addClientWithEmail(
    client: Omit<Client, "id">,
    password: string
  ): Promise<{ id: string; emailSent: boolean }> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      // 1. Sauvegarder la session actuelle
      const originalUser = currentUser;

      // 2. Envoyer l'email de bienvenue (si votre backend est configuré)
      const emailSent = await this.sendWelcomeEmail(client, password);
      
      // 3. Créer le document client dans Firestore
      const clientWithCreator = {
        ...client,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(firebasestore, "clients"), clientWithCreator);

      // 4. Créer le compte utilisateur pour le client
      await this.createClientUserAccount(client.email, password, docRef.id, originalUser);

      return { id: docRef.id, emailSent };
    } catch (error) {
      console.error("Error in addClientWithEmail:", error);
      throw error;
    }
  }

  private static async sendWelcomeEmail(
    client: Omit<Client, "id">,
    password: string
  ): Promise<boolean> {
    const backendUrls = ['http://192.168.117.160:3001'];
    
    for (const url of backendUrls) {
      try {
        const pingResponse = await fetch(`${url}/ping`);
        if (!pingResponse.ok) continue;

        const emailResponse = await fetch(`${url}/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: client.email,
            name: client.name,
            password,
            address: client.address
          })
        });

        const result = await emailResponse.json();
        return result.success;
      } catch (error) {
        console.warn(`Échec avec ${url}:`, error);
        continue;
      }
    }
    return false;
  }
static async createUserAccount(
  email: string, 
  password: string, 
  clientId: string
): Promise<User> {
  try {
    // Sauvegarder l'utilisateur actuel
    const currentUser = firebaseAuth.currentUser;
    
    // Créer le nouveau compte
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    // Restaurer la session précédente
    if (currentUser) {
      await firebaseAuth.updateCurrentUser(currentUser);
    }

    const userData = {
      uid: user.uid,
      email,
      role: "destinataire",
      clientId
    };

    await setDoc(doc(firebasestore, "users", user.uid), userData);
    await sendEmailVerification(user);

    return userData;
  } catch (error) {
    console.error("Error creating user account:", error);
    throw new Error("Erreur lors de la création du compte utilisateur");
  }
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
  try {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    console.log("Fetching clients for user:", currentUser.uid); // Ajouté

    const q = query(
      collection(firebasestore, "clients"),
      where("createdBy", "==", currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Client));

    console.log("Found clients:", clients); // Ajouté
    return clients;
    
  } catch (error) {
    console.error("Error getting clients:", error);
    throw new Error("Erreur lors de la récupération des clients");
  }
}
}