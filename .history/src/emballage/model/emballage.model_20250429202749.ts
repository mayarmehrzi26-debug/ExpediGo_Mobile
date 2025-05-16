import {orderBy, query,addDoc, collection, serverTimestamp, where } from "firebase/firestore";
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
  userId: string;
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

export const createOrder = async (
  order: Omit<EmballageOrder, "id" | "status" | "timestamp" | "userId">,
  userId: string
) => {
  try {
    const docRef = await addDoc(collection(firebasestore, "orders"), {
      ...order,
      status: "non traité",
      timestamp: serverTimestamp(),
      userId: userId,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getUserOrders = (userId: string, callback: (orders: EmballageOrder[]) => void) => {
  const q = query(
    collection(firebasestore, "orders"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const ordersData: EmballageOrder[] = [];
    querySnapshot.forEach((doc) => {
      ordersData.push({
        id: doc.id,
        ...doc.data(),
      } as EmballageOrder);
    });
    callback(ordersData);
  });
};