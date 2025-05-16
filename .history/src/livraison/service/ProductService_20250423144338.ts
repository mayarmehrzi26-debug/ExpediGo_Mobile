import { collection, getDocs } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const ProductService = {
  fetchProducts: async () => {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      imageUrl: doc.data().imageUrl,
      amount: doc.data().amount,
    }));
  },
};