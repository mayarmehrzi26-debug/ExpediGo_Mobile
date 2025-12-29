// Firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Fetch API (si vous utilisez des requêtes HTTP)
import { fetch } from 'react-native-fetch-api'; // Alternative: import fetch from 'node-fetch';

// Interfaces
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
  password?: string;
}

/**
 * Crée un nouveau client dans Firestore
 */
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
  try {
    const newClientRef = await firestore().collection('clients').add({
      ...clientData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    const doc = await newClientRef.get();
    
    return {
      id: newClientRef.id,
      ...doc.data() as Omit<Client, 'id'>,
      createdAt: doc.data()?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating client:', error);
    throw new Error('Échec de la création du client');
  }
};

/**
 * Crée un compte utilisateur avec Firebase Auth
 */
export const createUserAccount = async (userData: Omit<User, 'uid'>): Promise<User> => {
  try {
    const tempPassword = Math.random().toString(36).slice(-8);

    const userCredential = await auth().createUserWithEmailAndPassword(
      userData.email,
      tempPassword
    );

    if (!userCredential.user) {
      throw new Error("La création de l'utilisateur a échoué");
    }

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
      password: tempPassword,
    };
  } catch (error) {
    console.error('Error creating user account:', error);
    throw new Error('Échec de la création du compte utilisateur');
  }
};

/**
 * Envoie l'email de bienvenue via l'API
 */
export const sendWelcomeEmail = async (
  email: string, 
  name: string, 
  password: string, 
  address: string
): Promise<any> => {
  try {
    const response = await fetch('https://votre-api.com/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Si nécessaire
      },
      body: JSON.stringify({ email, name, password, address }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error("Échec de l'envoi de l'email de bienvenue");
  }
};