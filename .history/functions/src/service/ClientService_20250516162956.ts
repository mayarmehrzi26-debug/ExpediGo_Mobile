import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { firebaseAuth, firebasestore, functions } from "../../../FirebaseConfig";

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
  name?: string;
}

export class ClientService {
  /**
   * Ajoute un nouveau client et envoie les identifiants par email
   */
  static async addClient(client: Omit<Client, "id">): Promise<{clientId: string, tempPassword: string}> {
    try {
      // 1. Ajouter le client dans Firestore
      const docRef = await addDoc(collection(firebasestore, "clients"), {
        ...client,
        createdAt: new Date().toISOString()
      });
      
      // 2. Générer un mot de passe temporaire
      const tempPassword = this.generateTempPassword();
      
      return {
        clientId: docRef.id,
        tempPassword
      };
    } catch (error) {
      console.error("Error adding client:", error);
      throw new Error("Erreur lors de l'ajout du client");
    }
  }

  /**
   * Crée un compte utilisateur et envoie les identifiants
   */
  static async createUserAccount(
    email: string, 
    name: string,
    clientId: string,
    tempPassword: string // Ajoutez ce paramètre
  ): Promise<User> {
    // Utilisez tempPassword au lieu d'en générer un nouveau
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth, 
      email, 
      tempPassword // Utilisé ici
    );
  }

  /**
   * Envoie un email de bienvenue avec les identifiants
   */
  private static async sendWelcomeEmail(
    email: string, 
    name: string, 
    password: string,
    clientId: string
  ): Promise<void> {
    try {
      // Appel de la Cloud Function
      const sendEmail = httpsCallable(functions, 'sendClientCredentials');
      
      await sendEmail({
        email,
        name,
        password,
        clientId
      });
      
      console.log("Email envoyé avec succès à", email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error("Erreur lors de l'envoi de l'email de bienvenue");
    }
  }

  /**
   * Génère un mot de passe temporaire aléatoire
   */
  private static generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password + '!'; // Ajoute un caractère spécial pour les exigences de mot de passe
  }

  /**
   * Récupère tous les clients
   */
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

  /**
   * Récupère un client par son ID
   */
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

  /**
   * Met à jour un client
   */
  static async updateClient(clientId: string, clientData: Partial<Client>): Promise<void> {
    try {
      const clientRef = doc(firebasestore, "clients", clientId);
      await updateDoc(clientRef, clientData);
    } catch (error) {
      console.error("Error updating client:", error);
      throw new Error("Erreur lors de la mise à jour du client");
    }
  }
}