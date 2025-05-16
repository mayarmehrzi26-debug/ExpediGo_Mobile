import { useNavigation } from "@react-navigation/native"; // Importation de useNavigation
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import DeliveryCard from "../../src/components/DeliveryCard";
import FilterBar from "../../src/components/FilterBar";
import Header from "../../src/components/Header";
import FileExplorer from "../../src/components/LivExplorer";
import NavBottomHome from "../../src/components/NavBottomHome";

const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation(); // Accéder à la navigation

  // Filtrage selon le statut et la recherche
  const filteredDeliveries = deliveries
    .filter(
      (delivery) =>
        (delivery.status === "En cours de livraison" || delivery.status === "Livré"|| delivery.status === "Picked") &&
        delivery.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleCardSelection = (id: string) => {
    setSelectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Naviguer vers l'écran de détails de la livraison
  const handleViewDetails = (id: string) => {
    navigation.navigate("PackageDetails", { scannedData: id }); // Navigation vers l'écran de détails avec l'ID de la livraison
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Récupération des livraisons depuis Firestore
        const deliveriesCollection = collection(firebasestore, "livraisons");
        const deliverySnapshot = await getDocs(deliveriesCollection);
        const deliveryList = deliverySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveryList);
      } catch (error) {
        console.error("Erreur lors de la récupération des livraisons:", error);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={deliveries}
        filterOptions={["Toutes les livraisons", "Livrés", "Retours", "Échanges"]}
      />

      <FileExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              id={delivery.id}
              isSelected={selectedCards[delivery.id]}
              onToggleSelection={toggleCardSelection}
              onViewDetails={handleViewDetails} // Passer la fonction de navigation
              onEditPickup={() => console.log("Modifier la livraison")}
            />
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      <NavBottomHome activeScreen={activeScreen} />
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
    paddingTop: 0,
    padding: 20,
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  separator1: {
    height: 1,
    backgroundColor: "#877DAB",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default Livraison;
