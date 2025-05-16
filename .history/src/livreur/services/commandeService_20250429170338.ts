import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export const fetchCommandes = async () => {
  const commandes: any[] = [];

  // Requête pour les commandes d'emballage
  const q1 = query(collection(firebasestore, "orders"), where("status", "==", "non traité"));
  // Requête pour les livraisons
  const q2 = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));

  const [emballagesSnap, livraisonsSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

  // Traitement des emballages
  for (const docSnap of emballagesSnap.docs) {
    const data = docSnap.data();
    
    const clientSnap = await getDoc(doc(firebasestore, "clients", data.client));

    const clientData = clientSnap.exists() ? clientSnap.data() : {};

    let formattedDate = "Date inconnue";
    if (data.timestamp instanceof Timestamp) {
      const dateObj = data.timestamp.toDate();
      formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    commandes.push({
      id: docSnap.id,
      size: data.size,
      quantity: data.quantity,
      price: data.price,
      totalPrice: data.totalPrice,
      origin: "Entrepôt", // Pour les emballages, l'origine est toujours l'entrepôt
      destination: clientData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "non traité",
      clientEmail: clientData?.email || "",
      type: "emballage",
    });
  }

  // Traitement des livraisons (existant)
  for (const docSnap of livraisonsSnap.docs) {
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

    commandes.push({
      id: docSnap.id,
      origin: clientData?.address || "origine inconnue",
      destination: addressData?.address || "destination inconnue",
      date: formattedDate,
      status: data.status || "En attente",
      clientEmail: clientData?.email || "",
      type: "livraison",
    });
  }

  return commandes;
};

export const updateOrderStatus = async (orderId: string, status: string, type: "emballage" | "livraison") => {
  const collectionName = type === "emballage" ? "emballages" : "livraisons";
  const orderRef = doc(firebasestore, collectionName, orderId);

  try {
    await updateDoc(orderRef, {
      status: status,
    });
    console.log(`Statut de la commande ${orderId} mis à jour en ${status}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la commande", error);
    return false;
  }
};