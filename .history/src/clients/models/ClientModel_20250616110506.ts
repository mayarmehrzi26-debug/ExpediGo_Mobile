import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
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
}

export interface User {
  uid: string;
  email: string;
  role: string;
  clientId?: string;
}

export class ClientService {
  static async addClient(client: Omit<Client, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(firebasestore, "clients"), client);
      return docRef.id;
    } catch (error) {
      console.error("Error adding client:", error);
      throw new Error("Erreur lors de l'ajout du client");
    }
  }
// ClientService.ts - Version robuste
static async addClientWithEmail(
  client: Omit<Client, "id">,
  password: string
): Promise<{id: string, emailSent: boolean}> {
  // Ordre de priorité des URLs de connexion
  const backendUrls = [
    'http://10.0.2.2:3001',       // Android Emulator
    'http://localhost:3001',      // iOS Simulator
    'http://192.168.117.160:3001', // Votre PC en réseau local
    'http://20.20.0.63:3001'      // Serveur distant
  ];

  // Fonction fetch avec timeout
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  let lastError: Error | null = null;

  for (const url of backendUrls) {
    try {
      console.log(`Tentative de connexion à ${url}`);

      // 1. Test de connexion
      const ping = await fetchWithTimeout(`${url}/ping`, {
        method: 'GET'
      }, 3000);

      if (!ping.ok) {
        throw new Error(`Ping failed with status ${ping.status}`);
      }

      // 2. Envoi de l'email
      const response = await fetchWithTimeout(`${url}/send-welcome-email`, {
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
      }, 10000);

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Server error');
      }

      // 3. Création du client
      const docRef = await addDoc(collection(firebasestore, "clients"), client);
      return { id: docRef.id, emailSent: true };

    } catch (error) {
      console.warn(`Échec avec ${url}:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("Aucun serveur backend disponible");
}
  static async createUserAccount(
    email: string, 
    password: string, 
    clientId: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

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
      const clientRef = doc(firebasestore, "clients", clientId);
      await updateDoc(clientRef, clientData);
    } catch (error) {
      console.error("Error updating client:", error);
      throw new Error("Erreur lors de la mise à jour du client");
    }
  }

  static async deleteClient(clientId: string): Promise<void> {
    try {
      const clientRef = doc(firebasestore, "clients", clientId);
      await deleteDoc(clientRef);
    } catch (error) {
      console.error("Error deleting client:", error);
      throw new Error("Erreur lors de la suppression du client");
    }
  }
}