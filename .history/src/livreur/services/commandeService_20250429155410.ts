import { collection, getDocs, query, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchCommandes = async () => {
  const commandes: any[] = [];

  const q1 = query(collection(firebasestore, "orders"), where("status", "==", "non traité"));
  const q2 = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));

  const [ordersSnap, livraisonsSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

  for (const docSnap of ordersSnap.docs) {
    const data = docSnap.data();
    const clientSnap = await getDocs(collection(firebasestore, "clients"));
    const clientData = clientSnap.docs.find(d => d.id === data.client)?.data();

    commandes.push({
      ...data,
      id: docSnap.id,
      type: "emballage",
      origin: clientData?.address || "origine inconnue",
      destination: "destination inconnue", // pas pertinent pour les commandes d'emballage
      clientEmail: clientData?.email || "",
    });
  }

  for (const docSnap of livraisonsSnap.docs) {
    const data = docSnap.data();

    const clientSnap = await getDocs(collection(firebasestore, "clients"));
    const clientData = clientSnap.docs.find(d => d.id === data.client)?.data();

    const addressSnap = await getDocs(collection(firebasestore, "adresses"));
    const addressData = addressSnap.docs.find(d => d.id === data.address)?.data();

    commandes.push({
      ...data,
      id: docSnap.id,
      type: "livraison",
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      clientEmail: clientData?.email || "",
    });
  }

  return commandes;
};
