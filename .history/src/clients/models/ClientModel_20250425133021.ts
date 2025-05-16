import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

export interface Client {
  id?: string;
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
}

export class ClientService {
  static async addClient(client: Omit<Client, "id">): Promise<string> {
    const counterDocRef = doc(firebasestore, "counters", "clientCounter");
    const counterDoc = await getDoc(counterDocRef);
    let newId = 1;

    if (counterDoc.exists()) {
      newId = counterDoc.data().count + 1;
      await updateDoc(counterDocRef, { count: newId });
    } else {
      await setDoc(counterDocRef, { count: newId });
    }

    const clientWithId = { ...client, id: newId.toString() };
    const docRef = await addDoc(collection(firebasestore, "clients"), clientWithId);
    return docRef.id;
  }

  static async createUserAccount(
    email: string, 
    password: string, 
    clientId: string
  ): Promise<User> {
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
  }
  static async getClients(): Promise<any[]> {
    try {
      const q = query(collection(firebasestore, "clients"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting clients:", error);
      throw error;
    }
  }
}