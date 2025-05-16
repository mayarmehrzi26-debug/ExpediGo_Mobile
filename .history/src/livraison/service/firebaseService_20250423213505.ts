import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { fire } from "../../../FirebaseConfig";

export const fetchCollection = async (collectionName: string) => {
  try {
    const snapshot = await getDocs(collection(firestore, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

export const saveDeliveryToFirebase = async (deliveryData: any) => {
  try {
    const deliveryRef = doc(collection(firestore, "deliveries"));
    await setDoc(deliveryRef, {
      ...deliveryData,
      createdAt: new Date().toISOString(),
      status: "pending",
    });
    return true;
  } catch (error) {
    console.error("Error saving delivery:", error);
    throw error;
  }
};