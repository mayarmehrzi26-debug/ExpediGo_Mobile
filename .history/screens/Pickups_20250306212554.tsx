import { collection, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig"; // Assurez-vous que ce chemin est correct
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]); // Type any pour l'instant

  // Fetch Deliveries from Firebase
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const querySnapshot = await getDocs(collection(firebasestore, "livraisons"));
        const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
  
          // Récupérer les détails du produit
          const productDoc = await getDoc(doc(firebasestore, "products", data.product));
          const productData = productDoc.data();
  
          // Récupérer les détails du client
          const clientDoc = await getDoc(doc(firebasestore, "clients", data.client));
          const clientData = clientDoc.data();
  
          // Récupérer les détails de l'adresse
          const addressDoc = await getDoc(doc(firebasestore, "adresses", data.address));
          const addressData = addressDoc.data();
  
          return {
            id: doc.id,
            client: clientData? || "Client inconnu", // Afficher le nom du client
            address: addressData?.address || "Adresse inconnue", // Afficher l'adresse
            product: productData?.name || "Produit inconnu", // Afficher le nom du produit
            payment: data.payment,
            isExchange: data.isExchange,
            isFragile: data.isFragile,
            productImage: productData?.imageUrl || null, // Afficher l'image du produit
          };
        }));
  
        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };
  
    fetchDeliveries();
  }, []);
  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />

      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
                            <Text style={styles.deliveryTitle}> {delivery.id}</Text>

              <Text style={styles.deliveryTitle}>Client: {delivery.client}</Text>
              <Text style={styles.deliverySubtitle}>Adresse: {delivery.address}</Text>
              <Text style={styles.deliverySubtitle}>Produit: {delivery.product}</Text>
              <Text style={styles.deliverySubtitle}>Statut de paiement: {delivery.payment}</Text>
              <Text style={styles.deliverySubtitle}>
                {delivery.isExchange ? "C'est un échange" : "Livraison classique"}
              </Text>
              {delivery.isFragile && <Text style={styles.deliverySubtitle}>Colis fragile</Text>}

              {/* Vous pouvez afficher une image si disponible */}
              {delivery.productImage && (
                <Image source={{ uri: delivery.productImage }} style={styles.productImage} />
              )}

              {/* Afficher un bouton pour voir plus de détails */}
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Voir les détails</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      {/* Barre de navigation en bas */}
      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
  },
  deliverySubtitle: {
    fontSize: 14,
    color: "#A7A9B7",
    marginTop: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  detailsButton: {
    backgroundColor: "#54E598",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Pickups;
