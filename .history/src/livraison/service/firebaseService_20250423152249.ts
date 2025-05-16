import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../FirebaseConfig";

export const fetchCollection = async (name: string) => {
  const snapshot = await getDocs(collection(firebasestore, name));
  return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
};

export const saveLivraison = async (id: string, data: any) => {
  await setDoc(doc(firebasestore, "livraisons", id), data);
};
