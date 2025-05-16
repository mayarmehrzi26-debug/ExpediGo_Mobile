import { firebasestore } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const saveDeliveryToFirestore = async (deliveryData: any, id: string) => {
  await setDoc(doc(firebasestore, "livraisons", id), deliveryData);
};
