import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { firebasestore, firebaseAuth } from "../../../FirebaseConfig"; // 👈 auth remplacé ici

// Récupération de toutes les commandes non traitées
export const fetchCommandes = async () => {
  const commandes: any[] = [];

  const q1 = query(collection(firebasestore, "orders"), where("status", "==", "non traité"));
  const q2 = query(collection(firebasestore, "livraisons"), where("status", "==", "Non traité"));

  const [ordersSnap, livraisonsSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

  ordersSnap.forEach(doc => {
    commandes.push({ ...doc.data(), id: doc.id, type: "emballage" });
  });

  livraisonsSnap.forEach(doc => {
    commandes.push({ ...doc.data(), id: doc.id, type: "livraison" });
  });

  return commandes;
};

// Mise à jour du statut + ajout du livreur
export const updateCommandeStatus = async (commandeId: string, type: string) => {
  const userId = firebaseAuth.currentUser?.uid; // 👈 remplacé ici aussi
  const ref = doc(firebasestore, type === "livraison" ? "livraisons" : "orders", commandeId);

  const newStatus = type === "livraison" ? "En attente d’enlèvement" : "Accepté";

  await updateDoc(ref, {
    status: newStatus,
    livredBy: userId,
  });
};
