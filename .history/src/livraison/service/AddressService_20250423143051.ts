import { collection, getDocs } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
import { Address } from "../model/Address";

export const AddressService = {
  fetchAddresses: async () => {
    const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      address: doc.data().address,
    }));
  },
};