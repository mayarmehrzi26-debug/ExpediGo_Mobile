import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, or, query, setDoc, updateDoc, where } from "firebase/firestore";
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
  sharedWith?: string[];
}

export interface User {
  uid: string;
  email: string;
  role: string;
  clientIds?: string[];
}

export class ClientService {
  static async clientExists(email: string, phone: string): Promise<Client | null> {
    try {
      const q = query(
        collection(firebasestore, "clients"),
        or(
          where("email", "==", email),
          where("phone", "==", phone)
        )
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as Client;
    } catch (error) {
      console.error("Error checking client:", error);
      return null;
    }
  }

  static async addClient(client: Omit<Client, "id">): Promise<string> {
    try {
      const existingClient = await this.clientExists(client.email, client.phone);
      
      if (existingClient) {
        if (!existingClient.sharedWith?.includes(client.createdBy)) {
          await updateDoc(doc(firebasestore, "clients", existingClient.id), {
            sharedWith: arrayUnion(client.createdBy)
          });
        }
        return existingClient.id;
      } else {
        const docRef = await addDoc(collection(firebasestore, "clients"), {
          ...client,
          sharedWith: [client.createdBy]
        });
        return docRef.id;
      }
    } catch (error) {
      console.error("Error adding client:", error);
      throw new Error("Erreur lors de l'ajout du client");
    }
  }

  static async addClientWithEmail(
    client: Omit<Client, "id">, 
    password: string
  ): Promise<{id: string, emailSent: boolean, isNew: boolean}> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error("Utilisateur non connecté");

    const existingClient = await this.clientExists(client.email, client.phone);
    
    if (existingClient) {
      if (!existingClient.sharedWith?.includes(currentUser.uid)) {
        await updateDoc(doc(firebasestore, "clients", existingClient.id), {
          sharedWith: arrayUnion(currentUser.uid)
        });
      }
      
      return { 
        id: existingClient.id, 
        emailSent: false, 
        isNew: false 
      };
    }

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
        if (!result.success) throw new Error(result.error || 'Erreur inconnue');

        const clientWithCreator = {
          ...client,
          createdBy: currentUser.uid,
          sharedWith: [currentUser.uid]
        };

        const docRef = await addDoc(collection(firebasestore, "clients"), clientWithCreator);
        return { 
          id: docRef.id, 
          emailSent: true, 
          isNew: true 
        };

      } catch (error) {
        console.warn(`Échec avec ${url}:`, error.message);
        continue;
      }
    }
    throw new Error("Impossible de se connecter au serveur");
  }

  static async createUserAccount(
    email: string, 
    password: string, 
    clientId: string
  ): Promise<User> {
    try {
      const currentUser = firebaseAuth.currentUser;
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      const userData: User = {
        uid: user.uid,
        email,
        role: "destinataire",
        clientIds: [clientId]
      };

      await setDoc(doc(firebasestore, "users", user.uid), userData);
      await sendEmailVerification(user);

      if (currentUser) {
        await firebaseAuth.updateCurrentUser(currentUser);
      }

      return userData;
    } catch (error) {
      console.error("Error creating user account:", error);
      throw new Error("Erreur lors de la création du compte utilisateur");
    }
  }

  static async updateUserClientId(userId: string, clientId: string): Promise<void> {
    try {
      const userRef = doc(firebasestore, "users", userId);
      await updateDoc(userRef, { 
        clientIds: arrayUnion(clientId) 
      });
    } catch (error) {
      console.error("Error updating user with clientId:", error);
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  static async getClientsByCurrentUser(): Promise<Client[]> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) throw new Error("Utilisateur non connecté");

      const q = query(
        collection(firebasestore, "clients"),
        or(
          where("createdBy", "==", currentUser.uid),
          where("sharedWith", "array-contains", currentUser.uid)
        )
      );
      
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
      
      if (!docSnap.exists()) return null;
      
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
      if (!currentUser) throw new Error("Utilisateur non connecté");

      const clientRef = doc(firebasestore, "clients", clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) throw new Error("Client non trouvé");
      
      const client = clientDoc.data() as Client;
      if (client.createdBy !== currentUser.uid) {
        throw new Error("Vous n'êtes pas autorisé à modifier ce client");
      }

      await updateDoc(clientRef, clientData);
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }

  static async deleteClient(clientId: string): Promise<void> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) throw new Error("Utilisateur non connecté");

      const clientRef = doc(firebasestore, "clients", clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) throw new Error("Client non trouvé");
      
      const client = clientDoc.data() as Client;
      if (client.createdBy !== currentUser.uid) {
        throw new Error("Vous n'êtes pas autorisé à supprimer ce client");
      }

      await deleteDoc(clientRef);
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }
}