import { collection, getDocs } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
import { Client } from "../models/Client";

export const ClientService = {
  fetchClients: async () => {
    const querySnapshot = await getDocs(collection(firebasestore, "clients"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  },
};