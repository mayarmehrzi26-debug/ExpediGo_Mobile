import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";
import { ClientService } from "../models/ClientModel";

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
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error("Utilisateur non connecté");
  }

  const backendUrls = [
    'http://192.168.117.160:3001'
  ];

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
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue');
      }

      // Ajout de l'ID de l'utilisateur créateur
      const clientWithCreator = {
        ...client,
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(firebasestore, "clients"), clientWithCreator);
      return { id: docRef.id, emailSent: true };

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

    const q = query(
      collection(firebasestore, "clients"),
      where("createdBy", "==", currentUser.uid)
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
}
export interface AjoutClientView {
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  navigateBack(): void;
}

export class AjoutClientPresenter {
  private view: AjoutClientView;
  
  constructor(view: AjoutClientView) {
    this.view = view;
  }

  async handleSubmit(clientData: {
    name: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    address: string;
  }) {
    if (!clientData.name || !clientData.phone || !clientData.email || 
        !clientData.latitude || !clientData.longitude) {
      this.view.showError("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      this.view.setLoading(true);
      const randomPassword = Math.random().toString(36).slice(-8);

      const { id: clientId, emailSent } = await ClientService.addClientWithEmail({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        createdAt: new Date().toISOString()
      }, randomPassword);

      if (!emailSent) {
        throw new Error("L'email n'a pas pu être envoyé");
      }

      await ClientService.createUserAccount(
        clientData.email, 
        randomPassword, 
        clientId
      );

      this.view.showSuccess(
        "Succès", 
        "Client ajouté avec succès.",
        () => this.view.navigateBack()
      );
      
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email invalide";
      } else if (error.message === "Utilisateur non connecté") {
        errorMessage = "Vous devez être connecté pour ajouter un client";
      }
      
      this.view.showError("Erreur", errorMessage);
    } finally {
      this.view.setLoading(false);
    }
  }
}