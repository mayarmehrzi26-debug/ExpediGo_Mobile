// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firebaseAuth, fir } from "../../FirebaseConfig";

export const registerUser = async (
  email: string, 
  password: string, 
  role: string,
  clientData: {
    name: string;
    phone: string;
    address: string;
  }
) => {
  try {
    // Création du compte utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Enregistrement des infos supplémentaires
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      role,
      ...clientData,
      createdAt: new Date().toISOString()
    });

    // Envoi de l'email de bienvenue
    await sendWelcomeEmail(user.email, password);

    return userCredential;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (email: string | null, tempPassword: string) => {
  if (!email) return;

  try {
    // 1. Envoyer l'email de vérification Firebase
    await sendEmailVerification(auth.currentUser!);
    
    // 2. Envoyer un email personnalisé avec le mot de passe temporaire
    const actionCodeSettings = {
      url: 'https://votreapp.com/login', // URL de votre application
      handleCodeInApp: true
    };
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    console.log("Email de bienvenue envoyé à", email);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8) + "A1!";
};