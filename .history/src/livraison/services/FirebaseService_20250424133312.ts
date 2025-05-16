import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchCollection = async (collectionName: string) => {
  const snapshot = await getDocs(collection(firebasestore, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
};

export const saveDocument = async (collectionName: string, docId: string, data: any) => {
  await setDoc(doc(firebasestore, collectionName, docId), data);
};
