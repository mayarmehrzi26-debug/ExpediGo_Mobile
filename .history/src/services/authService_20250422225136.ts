// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { fire } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../FirebaseConfig";

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
    // 1. Création du compte
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Mise à jour du profil
    await updateProfile(user, {
      displayName: clientData.name
    });

    // 3. Enregistrement dans Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      role,
      ...clientData,
      createdAt: new Date().toISOString(),
      tempPassword: password // Stockage temporaire (optionnel)
    });

    // 4. Envoi des emails
    await sendAccountEmails(user.email!, password, clientData.name);

    return userCredential;
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    throw error;
  }
};

const sendAccountEmails = async (email: string, password: string, name: string) => {
  try {
    // Email de vérification
    await sendEmailVerification(auth.currentUser!, {
      url: 'https://votreapp.com/login?newUser=true',
      handleCodeInApp: true
    });

    // Email personnalisé avec identifiants
    const actionCodeSettings = {
      url: `https://votreapp.com/login?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    console.log("Emails envoyés avec succès à", email);
  } catch (error) {
    console.error("Échec d'envoi des emails:", error);
    throw error;
  }
};

export const generateRandomPassword = () => {
  const randomPart = Math.random().toString(36).slice(-8);
  return `${randomPart}A1!`; // Mot de passe sécurisé
};