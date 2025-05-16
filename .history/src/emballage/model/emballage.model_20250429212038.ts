import { getAuth } from "firebase/auth";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
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

export const createOrder = async (order: Omit<EmballageOrder, "id" | "status" | "timestamp" | "createdBy" | "addressDetails">) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    // Récupérer les détails de l'adresse
    const addressDoc = await getDocs(query(
      collection(firebasestore, "adresses"),
      where("id", "==", order.addressId),
      where("userId", "==", currentUser.uid)
    ));

    if (addressDoc.empty) {
      throw new Error("Adresse invalide");
    }

    const addressData = addressDoc.docs[0].data();

    const docRef = await addDoc(collection(firebasestore, "orders"), {
      ...order,
      status: "non traité",
      timestamp: serverTimestamp(),
      createdBy: currentUser.uid,
      addressDetails: {
        fullAddress: addressData.address,
        city: addressData.city,
        postalCode: addressData.postalCode
      }
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
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