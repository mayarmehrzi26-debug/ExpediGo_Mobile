// src/services/authService.ts
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseAuth } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { firebasestore } from "../../FirebaseConfig";

export const registerUser = async (email: string, password: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ajouter le rôle dans Firestore
    await setDoc(doc(firebasestore, "users", user.uid), {
      email: user.email,
      role,
      createdAt: new Date().toISOString()
    };

    // Envoyer l'email de vérification
    await sendWelcomeEmail(user.email);

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (email: string | null) => {
  if (!email) return;
  
  // Ici vous pouvez utiliser un service d'email comme SendGrid ou un service Firebase
  // Ceci est un exemple basique
  try {
    await sendEmailVerification(firebaseAuth.currentUser!);
    console.log("Welcome email sent");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8); // Génère un mot de passe aléatoire
};