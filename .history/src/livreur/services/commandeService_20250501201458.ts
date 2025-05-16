import {Osnapshot,addDoc,orderBy, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

interface Livraison {
  id?: string;
  origin: string;
  originLat: number;
  originLng: number;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  status: "Non traité" | "En attente d'enlèvement" | "Picked" | "En cours de livraison" | "Livré";
  date: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  createdBy: {
    name: string;
    phone: string;
    email: string;
  };
}
interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  commandeId: string;
}

export const fetchLivraisons = async () => {
  const q = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));
  const querySnapshot = await getDocs(q);
  
  const livraisons: Livraison[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const [clientSnap, addressSnap] = await Promise.all([
      getDoc(doc(firebasestore, "clients", data.client)),
      getDoc(doc(firebasestore, "adresses", data.address))
    ]);

    const clientData = clientSnap.exists() ? clientSnap.data() : {};
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    let formattedDate = "Date inconnue";
    if (data.createdAt instanceof Timestamp) {
      const dateObj = data.createdAt.toDate();
      formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    livraisons.push({
      id: docSnap.id,
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "Non traité",
      clientEmail: clientData?.email || "",
      clientPhone: clientData?.phone || "",
      clientName: clientData?.name || "",

      type: "livraison"
    });
  }

  return livraisons;
};

export const updateLivraisonStatus = async (livraisonId: string, status: Livraison["status"]) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    console.error("Aucun utilisateur connecté");
    return false;
  }

  const livraisonRef = doc(firebasestore, "livraisons", livraisonId);
  const updateData: Partial<Livraison> = {
    status,
    updatedAt: Timestamp.now()
  };

  if (status === "En attente d'enlèvement") {
    updateData.assignedTo = user.uid;
  }

  try {
    await updateDoc(livraisonRef, updateData);
    console.log(`Livraison ${livraisonId} mise à jour:`, updateData);
    return true;
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    return false;
  }
};
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
      
      // Récupération des données client, adresse et créateur
      const [clientSnap, addressSnap, createdBySnap] = await Promise.all([
        getDoc(doc(firebasestore, "clients", data.client)),
        getDoc(doc(firebasestore, "adresses", data.address)),
        getDoc(doc(firebasestore, "users", data.createdBy))
      ]);

      const clientData = clientSnap.data() || {};
      const addressData = addressSnap.data() || {};
      const createdByData = createdBySnap.data() || {};

      // Formatage de la date
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
          email: clientData.email || "",
          phone: clientData.phone || "",
          name: clientData.name || ""
        },
        createdBy: {
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
export const sendMessage = async (commandeId: string, text: string, sender: {id: string, name: string}) => {
  try {
    const messagesRef = collection(firebasestore, "commandes", commandeId, "messages");
    const newMessage: Omit<Message, 'id'> = {
      text,
      senderId: sender.id,
      senderName: sender.name,
      timestamp: Timestamp.now(),
      commandeId
    };
    
    await addDoc(messagesRef, newMessage);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return false;
  }
};

export const getMessages = async (commandeId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(firebasestore, "commandes", commandeId, "messages");
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

export const setupMessagesListener = (commandeId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(firebasestore, "commandes", commandeId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};