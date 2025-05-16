import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

interface Livraison {
  id?: string;
  client: string;
  address: string;
  status: "Non traité" | "En cours" | "Traité";
  createdAt: any;
}

export const fetchLivraisons = async () => {
  const q = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));
  const querySnapshot = await getDocs(q);
  
  const livraisons: any[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const clientSnap = await getDoc(doc(firebasestore, "clients", data.client));
    const addressSnap = await getDoc(doc(firebasestore, "adresses", data.address));

    const clientData = clientSnap.exists() ? clientSnap.data() : {};
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    let formattedDate = "Date inconnue";
    if (data.createdAt instanceof Timestamp) {
      const dateObj = data.createdAt.toDate();
      formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (data.date) {
      formattedDate = data.date;
    }

    livraisons.push({
      id: docSnap.id,
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "Non traité",
      clientEmail: clientData?.email || "",
      type: "livraison"
    });
  }

  return livraisons;
};

export const updateLivraisonStatus = async (livraisonId: string, status: "Non traité" | "En cours" | "Traité") => {
  const livraisonRef = doc(firebasestore, "livraisons", livraisonId);

  try {
    await updateDoc(livraisonRef, { status });
    console.log(`Statut de la livraison ${livraisonId} mis à jour en ${status}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la livraison", error);
    return false;
  }
};