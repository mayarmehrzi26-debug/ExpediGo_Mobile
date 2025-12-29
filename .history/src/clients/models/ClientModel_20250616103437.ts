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
static async addClientWithEmail(
  client: Omit<Client, "id">, 
  password: string
): Promise<{id: string, emailSent: boolean}> {
  try {
    const backendUrl = 'http://20.20.0.63:3001';
    
    // 1. D'abord essayer d'envoyer l'email
    const emailResponse = await fetch(`${backendUrl}/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: client.email,
        name: client.name,
        password: password,
        address: client.address
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Erreur backend:', errorText);
      throw new Error("Échec de l'envoi de l'email");
    }

    const emailResult = await emailResponse.json();
    if (!emailResult.success) {
      throw new Error(emailResult.error || "Le serveur a échoué à envoyer l'email");
    }

    // 2. Si l'email est envoyé, créer le client
    const docRef = await addDoc(collection(firebasestore, "clients"), client);
    
    return {
      id: docRef.id,
      emailSent: true
    };
  } catch (error) {
    console.error("Échec complet:", {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
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