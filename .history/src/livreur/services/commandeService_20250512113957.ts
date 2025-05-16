import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

interface Livraison {
  id?: string;
  origin: string;
  originLat: number;
  originLng: number;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  status: "Non traité" | "En attente d'enlèvement" | "En cours de pickup" | "Picked" | "En cours de livraison" | "Livré"; 
  date: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdBy: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  assignedTo?: string;
}

interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  livraisonId: string;
}

/**
 * Récupère toutes les livraisons non traitées
 */
export const fetchLivraisons = async (): Promise<Livraison[]> => {
  try {
    const q = query(
      collection(firebasestore, "livraisons"), 
      where("status", "==", "Non traité")
    );
    const querySnapshot = await getDocs(q);
    
    const livraisons: Livraison[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const [clientSnap, addressSnap, createdBySnap] = await Promise.all([
        getDoc(doc(firebasestore, "clients", data.client)),
        getDoc(doc(firebasestore, "adresses", data.address)),
        getDoc(doc(firebasestore, "users", data.createdBy))
      ]);

      const clientData = clientSnap.data() || {};
      const addressData = addressSnap.data() || {};
      const createdByData = createdBySnap.data() || {};

      let formattedDate = "Date inconnue";
      if (data.createdAt instanceof Timestamp) {
        formattedDate = data.createdAt.toDate().toLocaleString();
      }

      livraisons.push({
        id: docSnap.id,
        origin: clientData.address || "Adresse inconnue",
        originLat: Number(clientData.latitude) || 0,
        originLng: Number(clientData.longitude) || 0,
        destination: addressData.address || "Adresse inconnue",
        destinationLat: Number(addressData.latitude) || 0,
        destinationLng: Number(addressData.longitude) || 0,
        status: data.status || "Non traité",
        date: formattedDate,
        client: {
          id: data.client,
          name: clientData.name || "",
          email: clientData.email || "",
          phone: clientData.phone || ""
        },
        createdBy: {
          id: data.createdBy,
          name: createdByData.name || "",
          phone: createdByData.phone || "",
          email: createdByData.email || ""
        }
      });
    }

    return livraisons;
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons:", error);
    return [];
  }
};

/**
 * Met à jour le statut d'une livraison
 */
export const updateLivraisonStatus = async (
  livraisonId: string, 
  status: Livraison["status"]
): Promise<boolean> => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    console.error("Aucun utilisateur connecté");
    return false;
  }

  try {
    const livraisonRef = doc(firebasestore, "livraisons", livraisonId);
    const updateData: Partial<Livraison> = {
      status,
      updatedAt: Timestamp.now()
    };

    if (status === "En attente d'enlèvement") {
      updateData.assignedTo = user.uid;
    }

    await updateDoc(livraisonRef, updateData);
    return true;
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    return false;
  }
};

/**
 * Récupère les livraisons assignées à l'utilisateur courant
 */
export const fetchMesLivraisons = async (): Promise<Livraison[]> => {
  const user = firebaseAuth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(firebasestore, "livraisons"),
      where("assignedTo", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const livraisons = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const [clientSnap, addressSnap, createdBySnap] = await Promise.all([
        getDoc(doc(firebasestore, "clients", data.client)),
        getDoc(doc(firebasestore, "adresses", data.address)),
        getDoc(doc(firebasestore, "users", data.createdBy))
      ]);

      const clientData = clientSnap.data() || {};
      const addressData = addressSnap.data() || {};
      const createdByData = createdBySnap.data() || {};

      let formattedDate = "Date inconnue";
      if (data.createdAt instanceof Timestamp) {
        formattedDate = data.createdAt.toDate().toLocaleString();
      }

      return {
        id: docSnap.id,
        origin: clientData.address || "Adresse inconnue",
        originLat: Number(clientData.latitude) || 0,
        originLng: Number(clientData.longitude) || 0,
        destination: addressData.address || "Adresse inconnue",
        destinationLat: Number(addressData.latitude) || 0,
        destinationLng: Number(addressData.longitude) || 0,
        status: data.status || "Non traité",
        date: formattedDate,
        client: {
          id: data.client,
          name: clientData.name || "",
          email: clientData.email || "",
          phone: clientData.phone || ""
        },
        createdBy: {
          id: data.createdBy,
          name: createdByData.name || "",
          phone: createdByData.phone || "",
          email: createdByData.email || ""
        }
      };
    }));

    return livraisons;
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons:", error);
    return [];
  }
};

/**
 * Envoie un message dans le chat d'une livraison
 */
export const sendMessage = async (
  livraisonId: string, 
  text: string, 
  sender: {id: string, name: string}
): Promise<boolean> => {
  try {
    const messagesRef = collection(firebasestore, "livraisons", livraisonId, "messages");
    
    const newMessage: Omit<Message, 'id'> = {
      text,
      senderId: sender.id,
      senderName: sender.name,
      timestamp: Timestamp.now(),
      livraisonId
    };
    
    await addDoc(messagesRef, newMessage);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return false;
  }
};

/**
 * Récupère tous les messages d'une livraison
 */
export const getMessages = async (livraisonId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(firebasestore, "livraisons", livraisonId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return [];
  }
};

/**
 * Écoute en temps réel les messages d'une livraison
 */
export const setupMessagesListener = (
  livraisonId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(firebasestore, "livraisons", livraisonId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};