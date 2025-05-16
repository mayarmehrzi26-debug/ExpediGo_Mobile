export const fetchEmballages = async () => {
  try {
    const q = query(
      collection(firebasestore, "orders"), 
      where("status", "==", "non traité")
    );
    const querySnapshot = await getDocs(q);
    
    const emballages = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Formatage de base
      const emballage = {
        id: docSnap.id, // ID complet non tronqué
        size: data.size || "Non spécifié",
        quantity: data.quantity || 0,
        price: data.price || 0,
        totalPrice: data.totalPrice || 0,
        status: data.status || "non traité",
        addressId: data.addressId || "",
        createdBy: data.createdBy || "",
        timestamp: data.timestamp?.toDate?.() || null,
        formattedDate: data.timestamp?.toDate?.().toLocaleString('fr-FR') || "Date inconnue"
      };

      // Récupération des détails utilisateur
      try {
        if (emballage.createdBy) {
          const userDoc = await getDoc(doc(firebasestore, "users", emballage.createdBy));
          if (userDoc.exists()) {
            emballage.userInfo = {
              email: userDoc.data().email || "Email inconnu",
              displayName: userDoc.data().displayName || userDoc.data().name || "Utilisateur inconnu"
            };
          }
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }

      // Récupération des détails d'adresse
      try {
        if (emballage.addressId) {
          const addressDoc = await getDoc(doc(firebasestore, "adresses", emballage.addressId));
          if (addressDoc.exists()) {
            emballage.addressInfo = {
              fullAddress: addressDoc.data().address || "Adresse inconnue"
            };
          }
        }
      } catch (error) {
        console.error("Erreur récupération adresse:", error);
      }

      emballages.push(emballage);
    }
    
    return emballages;
  } catch (error) {
    console.error("Erreur lors de la récupération des emballages:", error);
    return [];
  }
};