import { getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
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

export const createOrder = async (order: Omit<EmballageOrder, "id" | "status" | "timestamp" | "createdBy" | "addressDetails">) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    // Correction de la requête d'adresse
    const addressQuery = await getDocs(
      query(
        collection(firebasestore, "adresses"),
        where("__name__", "==", order.addressId),
        where("userId", "==", currentUser.uid)
      )
    );

    if (addressQuery.empty) {
      console.error("Adresse introuvable - ID:", order.addressId);
      throw new Error("L'adresse sélectionnée n'existe plus. Veuillez en choisir une autre.");
    }

    const addressDoc = addressQuery.docs[0];
    const addressData = addressDoc.data();

    // Ensure all required address fields exist
    if (!addressData.address || !addressData.city || !addressData.postalCode) {
      throw new Error("L'adresse sélectionnée est incomplète. Veuillez en choisir une autre.");
    }

    const docRef = await addDoc(collection(firebasestore, "orders"), {
      ...order,
      status: "non traité",
      timestamp: serverTimestamp(),
      createdBy: currentUser.uid,
      addressDetails: {
        fullAddress: `${addressData.address}, ${addressData.city} ${addressData.postalCode}`,
        city: addressData.city || "", // Fallback to empty string if undefined
        postalCode: addressData.postalCode || "" // Fallback to empty string if undefined
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Détails de l'erreur:", {
      error,
      addressId: order.addressId,
      userId: getAuth().currentUser?.uid
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