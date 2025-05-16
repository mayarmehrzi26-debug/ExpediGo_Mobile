import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map((doc) => ({
      label: doc.data().name,
      value: doc.id,
      image: doc.data().imageUrl,
      price: doc.data().amount,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchClients = async () => {
  const querySnapshot = await getDocs(collection(firebasestore, "clients"));
  return querySnapshot.docs.map((doc) => ({
    label: doc.data().name,
    value: doc.id,
  }));
};

export const fetchAdresses = async () => {
  const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
  return querySnapshot.docs.map((doc) => ({
    label: doc.data().address,
    value: doc.id,
  }));
};

export const fetchDefaultStatus = async () => {
  const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
  return statusSnapshot.empty ? null : statusSnapshot.docs[0].data().nomStat;
};

export const saveDelivery = async (deliveryData: any) => {
  const newId = Math.floor(Math.random() * 1000000).toString();
  await setDoc(doc(firebasestore, "livraisons", newId), {
    ...deliveryData,
    id: newId,
    createdAt: new Date(),
  });
  return newId;
};