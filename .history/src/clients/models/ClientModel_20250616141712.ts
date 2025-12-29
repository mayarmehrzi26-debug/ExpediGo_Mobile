import { createUserWithEmailAndPassword } from "firebase/auth";
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
  password?: string; // Temporaire pour l'envoi par email
}

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
  // Ici vous implémenteriez l'appel à votre API ou base de données
  // Ceci est un exemple avec Firebase Firestore
  const newClientRef = await firestore().collection('clients').add({
    ...clientData,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  const newClient = {
    id: newClientRef.id,
    ...clientData,
    createdAt: new Date().toISOString(),
  };

  return newClient;
};

export const createUserAccount = async (userData: Omit<User, 'uid'>): Promise<User> => {
  // Génération d'un mot de passe temporaire
  const tempPassword = Math.random().toString(36).slice(-8);

  // Création de l'utilisateur dans Firebase Auth
  const userCredential = await auth().createUserWithEmailAndPassword(
    userData.email,
    tempPassword
  );

  if (!userCredential.user) {
    throw new Error("La création de l'utilisateur a échoué");
  }

  // Stockage des informations supplémentaires dans Firestore
  await firestore().collection('users').doc(userCredential.user.uid).set({
    email: userData.email,
    role: userData.role || 'client',
    clientId: userData.clientId,
  });

  return {
    uid: userCredential.user.uid,
    email: userData.email,
    role: userData.role || 'client',
    clientId: userData.clientId,
    password: tempPassword, // Pour l'envoi par email
  };
};

export const sendWelcomeEmail = async (email: string, name: string, password: string, address: string) => {
  try {
    const response = await fetch('https://votre-api.com/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password, address }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Échec de l'envoi de l'email");
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};