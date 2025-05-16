import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firebasestore } from "../FirebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../FirebaseConfig";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
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
    // Gestion du compteur
    const counterDocRef = doc(firebasestore, "counters", "clientCounter");
    const counterDoc = await getDoc(counterDocRef);
    let newId = 1;

    if (counterDoc.exists()) {
      newId = counterDoc.data().count + 1;
      await updateDoc(counterDocRef, { count: newId });
    } else {
      await setDoc(counterDocRef, { count: newId });
    }

    // Ajout du client
    const clientWithId = { ...client, id: newId.toString() };
    const docRef = await addDoc(collection(firebasestore, "clients"), clientWithId);
    return docRef.id;
  }

  static async createUserAccount(email: string, password: string, clientId: string): Promise<User> {
    try {
      // Création de l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enregistrement dans la collection users
      const userData = {
        uid: user.uid,
        email,
        role: "destinataire",
        clientId
      };

      await setDoc(doc(firebasestore, "users", user.uid), userData);

      // Envoi de l'email de vérification
      await sendEmailVerification(user);

      return userData;
    } catch (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
  }
}