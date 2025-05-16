import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

interface Livraison {
  id: string;
  origin: string;
  originLat: number;
  originLng: number;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  status: string;
  date: string;
  clientEmail: string;
  clientPhone: string;
}

export const fetchMesLivraisons = async (): Promise<Livraison[]> => {
  const user = firebaseAuth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(firebasestore, "livraisons"),
      where("assignedTo", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const livraisons = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      
      // Récupération des données client et adresse
      const [clientSnap, addressSnap] = await Promise.all([
        getDoc(doc(firebasestore, "clients", data.client)),
        getDoc(doc(firebasestore, "adresses", data.address))
      ]);

      const clientData = clientSnap.data() || {};
      const addressData = addressSnap.data() || {};

      // Formatage de la date
      let formattedDate = "Date inconnue";
      if (data.createdAt instanceof Timestamp) {
        formattedDate = data.createdAt.toDate().toLocaleString();
      }

      return {
        id: docSnap.id,
        origin: clientData.address || "Adresse inconnue",
        originLat: Number(clientData.latitude) || 0,
        originLng: Number(clientData.longitude) || 0,
        destination: addressData.address || "Adresse inconnue",
        destinationLat: Number(addressData.latitude) || 0,
        destinationLng: Number(addressData.longitude) || 0,
        status: data.status || "Non traité",
        date: formattedDate,
        clientEmail: clientData.email || "",
        clientPhone: clientData.phone || "",
      };
    }));

    return livraisons;
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons:", error);
    return [];
  }
};

export const updateLivraisonStatus = async (livraisonId: string, status: string): Promise<boolean> => {
  const user = firebaseAuth.currentUser;
  if (!user) return false;

  try {
    const livraisonRef = doc(firebasestore, "livraisons", livraisonId);
    await updateDoc(livraisonRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return false;
  }
};