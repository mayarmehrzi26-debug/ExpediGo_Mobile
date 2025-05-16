import { getAuth } from "firebase/auth";
import { 
  addDoc, collection, getDocs, query, 
  where, serverTimestamp, orderBy, onSnapshot
} from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface DropdownOption {
  label: string;
  value: string;
  originalData?: any;
}

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
  addressDetails: {
    fullAddress: string;
    city: string;
    postalCode: string;
  };
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
    throw new Error("Utilisateur non connecté");
  }

  try {
    const q = query(
      collection(firebasestore, "adresses"),
      where("userId", "==", currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      label: `${doc.data().address}, ${doc.data().city}`,
      value: doc.id,
      originalData: doc.data()
    }));
  } catch (error) {
    console.error("Erreur de récupération des adresses:", error);
    throw new Error("Impossible de charger les adresses");
  }
};

export const createOrder = async (order: Omit<EmballageOrder, "id" | "status" | "timestamp" | "createdBy" | "addressDetails">) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error("Utilisateur non connecté");
  }

  try {
    // Vérification de l'existence de l'adresse
    const addressDoc = await getDoc(doc(firebasestore, "adresses", order.addressId));
    
    if (!addressDoc.exists() || addressDoc.data()?.userId !== currentUser.uid) {
      throw new Error("Adresse invalide ou non autorisée");
    }

    const addressData = addressDoc.data();

    const orderData = {
      ...order,
      status: "non traité",
      timestamp: serverTimestamp(),
      createdBy: currentUser.uid,
      addressDetails: {
        fullAddress: addressData.address,
        city: addressData.city,
        postalCode: addressData.postalCode
      }
    };

    const docRef = await addDoc(collection(firebasestore, "orders"), orderData);
    return docRef.id;
  } catch (error) {
    console.error("Erreur création commande:", {
      error,
      addressId: order.addressId,
      userId: currentUser.uid
    });
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
    const ordersData: EmballageOrder[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    callback(ordersData);
  });
};