// src/services/authService.ts
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { fire, firebasestore } from "../../FirebaseConfig";

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
    // 1. Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Enregistrer les infos supplémentaires dans Firestore
    const userDocRef = doc(firebasestore, "users", user.uid);
    
    await setDoc(userDocRef, {
      email: user.email,
      role,
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address,
      createdAt: new Date().toISOString(),
      isActive: true
    });

    // 3. Envoyer l'email de bienvenue
    await sendEmailVerification(user);
    console.log("Email de vérification envoyé");

    return user;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    throw error;
  }
};

export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8) + "A1!"; // Mot de passe plus sécurisé
};