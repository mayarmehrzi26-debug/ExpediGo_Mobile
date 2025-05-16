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

    // Get the address document directly by ID instead of query
    const addressDoc = await getDoc(doc(firebasestore, "adresses", order.addressId));

    if (!addressDoc.exists()) {
      console.error("Adresse introuvable - ID:", order.addressId);
      throw new Error("L'adresse sélectionnée n'existe plus. Veuillez en choisir une autre.");
    }

    const addressData = addressDoc.data();

    // Validate required address fields
    const requiredFields = ['address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !addressData[field]);
    
    if (missingFields.length > 0) {
      console.error("Adresse incomplète - Champs manquants:", missingFields);
      throw new Error(`L'adresse est incomplète (${missingFields.join(', ')} manquant(s)).`);
    }

    const docRef = await addDoc(collection(firebasestore, "orders"), {
      ...order,
      status: "non traité",
      timestamp: serverTimestamp(),
      createdBy: currentUser.uid,
      addressDetails: {
        fullAddress: `${addressData.address}, ${addressData.city} ${addressData.postalCode}`,
        city: addressData.city,
        postalCode: addressData.postalCode
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Erreur de commande:", {
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