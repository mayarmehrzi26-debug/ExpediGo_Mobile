import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

interface Livraison {
  id?: string;
  client: string;
  address: string;
  status: "Non traité" | "En attente d'enlèvement" | "Picked" | "En cours de livraison" | "Livré";
  createdAt: any;
  assignedTo?: string;
  createdBy?: string;

}

export const fetchLivraisons = async () => {
  const q = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));
  const querySnapshot = await getDocs(q);
  
  const livraisons: Livraison[] = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const [clientSnap, addressSnap,const s = useRef(second)] = await Promise.all([
      getDoc(doc(firebasestore, "clients", data.client)),
      getDoc(doc(firebasestore, "adresses", data.address))
    ]);

    const clientData = clientSnap.exists() ? clientSnap.data() : {};
    const addressData = addressSnap.exists() ? addressSnap.data() : {};

    let formattedDate = "Date inconnue";
    if (data.createdAt instanceof Timestamp) {
      const dateObj = data.createdAt.toDate();
      formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    livraisons.push({
      id: docSnap.id,
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "Non traité",
      clientEmail: clientData?.email || "",
      clientPhone: clientData?.phone || "",
      clientName: clientData?.name || "",

      type: "livraison"
    });
  }

  return livraisons;
};

export const updateLivraisonStatus = async (livraisonId: string, status: Livraison["status"]) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    console.error("Aucun utilisateur connecté");
    return false;
  }

  const livraisonRef = doc(firebasestore, "livraisons", livraisonId);
  const updateData: Partial<Livraison> = {
    status,
    updatedAt: Timestamp.now()
  };

  if (status === "En attente d'enlèvement") {
    updateData.assignedTo = user.uid;
  }

  try {
    await updateDoc(livraisonRef, updateData);
    console.log(`Livraison ${livraisonId} mise à jour:`, updateData);
    return true;
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    return false;
  }
};
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
        clientName: clientData?.name  || "",
      };
    }));

    return livraisons;
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons:", error);
    return [];
  }
};