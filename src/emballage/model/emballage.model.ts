import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface EmballageSize {
  id: string;
  label: string;
  dimensions: string;
  price: number;
  available: boolean;
}

export interface EmballageOrder {
  id?: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "non traité" | "en cours" | "traité";
  timestamp: any;
  createdBy: string;
  addressId: string;
}

export const sizes: EmballageSize[] = [
  {
    id: "petit",
    label: "Petit",
    dimensions: "30x30 (cm)",
    price: 250,
    available: true,
  },
  {
    id: "large",
    label: "Large",
    dimensions: "40x50 (cm)",
    price: 300,
    available: true,
  },
  { id: "moyen", label: "Moyen", dimensions: "", price: 0, available: false },
  {
    id: "xlarge",
    label: "Extra large",
    dimensions: "",
    price: 0,
    available: false,
  },
];

export const fetchAdresses = async (): Promise<DropdownOption[]> => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return [];
  }

  try {
    const q = query(
      collection(firebasestore, "adresses"),
      where("userId", "==", currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      label: doc.data().address,
      value: doc.id
    }));
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};
const generateNumericId = async (): Promise<number> => {
  const counterRef = doc(firebasestore, "counters", "emballageOrders");
  
  try {
    return await runTransaction(firebasestore, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const newCount = counterDoc.exists() ? counterDoc.data().count + 1 : 1;
      transaction.set(counterRef, { count: newCount }, { merge: true });
      return newCount;
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw new Error("Erreur lors de la génération de l'ID numérique");
  }
};

export const createOrder = async (order: Omit<EmballageOrder, "id" | "status" | "timestamp" | "createdBy">) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) throw new Error("Utilisateur non connecté");

    const addressDoc = await getDoc(doc(firebasestore, "adresses", order.addressId));
    if (!addressDoc.exists()) throw new Error("Adresse introuvable");

    const numericId = await generateNumericId();
    const orderId = numericId.toString();

    await setDoc(doc(firebasestore, "orders", orderId), {
      ...order,
      id: orderId,
      status: "non traité",
      timestamp: serverTimestamp(),
      createdBy: currentUser.uid
    });
    
    return orderId;
  } catch (error) {
    console.error("Erreur de commande:", error);
    throw error;
  }
};
export const getUserOrders = (callback: (orders: EmballageOrder[]) => void) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return () => {};
  }

  const q = query(
    collection(firebasestore, "orders"),
    where("createdBy", "==", currentUser.uid),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const ordersData: EmballageOrder[] = [];
    querySnapshot.forEach((doc) => {
      ordersData.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as EmballageOrder);
    });
    callback(ordersData);
  });
};