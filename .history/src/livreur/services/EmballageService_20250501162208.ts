import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";

// Fonction existante pour tous les emballages non traités
export const fetchEmballages = async () => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "non traité")
    );
    const querySnapshot = await getDocs(q);
    
    return await processEmballages(querySnapshot);
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages:", error);
    return [];
  }
};

// Nouvelle fonction pour les emballages de l'utilisateur connecté
export const fetchUserEmballages = async () => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    const q = query(
      collection(firebasestore, "orders"),
      where("assignedTo", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return await processEmballages(querySnapshot);
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages utilisateur:", error);
    return [];
  }
};

// Fonction helper pour traiter les documents
const processEmballages = async (querySnapshot) => {
  const emballages = [];
    
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    
    // Récupération des données utilisateur
    let userEmail = "Email inconnu";
    let displayName = "Utilisateur inconnu";
    
    try {
      if (data.createdBy) {
        const userDoc = await getDoc(doc(firebasestore, "users", data.createdBy));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userEmail = userData?.email || userEmail;
          displayName = userData?.name || displayName;
          phone = userData?.phone || phone;

        }
      }
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
    }
    
    // Récupération des données d'adresse
    let fullAddress = "Adresse inconnue";
    try {
      if (data.addressId) {
        const addressDoc = await getDoc(doc(firebasestore, "adresses", data.addressId));
        if (addressDoc.exists()) {
          const addressData = addressDoc.data();
          fullAddress = addressData?.address || fullAddress;
        }
      }
    } catch (error) {
      console.error("Erreur récupération adresse:", error);
    }
    
    // Formatage de la date
    let formattedDate = "Date inconnue";
    try {
      if (data.timestamp?.toDate) {
        const dateObj = data.timestamp.toDate();
        formattedDate = dateObj.toLocaleString('fr-FR');
      }
    } catch (error) {
      console.error("Erreur formatage date:", error);
    }
    
    emballages.push({
      id: docSnap.id,
      ...data,
      userInfo: {
        email: userEmail,
        displayName: displayName,
        phone:phone
      },
      addressInfo: {
        fullAddress: fullAddress
      },
      formattedDate: formattedDate
    });
  }
  
  return emballages;
};

// Fonction existante pour mettre à jour le statut
export const updateEmballageStatus = async (emballageId: string, status: "non traité" | "Accepté" | "En cours de livraison" | "Livré" | "Retour") => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    const updateData: any = { 
      status,
      updatedAt: new Date() 
    };

    if (status === "En cours de livraison") {
      updateData.deliveryStartTime = new Date();
    }
    
    if (status === "Livré" || status === "Retour") {
      updateData.deliveryEndTime = new Date();
    }

    if (status === "Accepté" || status === "En cours de livraison") {
      updateData.assignedTo = user.uid;
    }

    if (status === "Retour") {
      updateData.returnReason = "Livraison non aboutie";
    }

    await updateDoc(doc(firebasestore, "orders", emballageId), updateData);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emballage:", error);
    return false;
  }
};
export const startDelivery = async (emballageId: string) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    await updateDoc(doc(firebasestore, "orders", emballageId), {
      status: "En cours de livraison",
      deliveryStartTime: new Date(),
      assignedTo: user.uid
    });
    return true;
  } catch (error) {
    console.error("Erreur démarrage livraison:", error);
    return false;
  }
};

export const completeDelivery = async (emballageId: string, isDelivered: boolean) => {
  try {
    const updateData: any = {
      status: isDelivered ? "Livré" : "Retour",
      deliveryEndTime: new Date()
    };

    if (!isDelivered) {
      updateData.returnReason = "Livraison non aboutie";
    }

    await updateDoc(doc(firebasestore, "orders", emballageId), updateData);
    return true;
  } catch (error) {
    console.error("Erreur fin de livraison:", error);
    return false;
  }
};