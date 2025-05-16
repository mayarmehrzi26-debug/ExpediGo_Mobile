import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import DeliveryCard from "../src/components/DeliveryCard";
import FilterBar from "../src/components/FilterBar";
import Header from "../src/components/Header";
import FileExplorer from "../src/components/LivExplorer";
import NavBottom from "../src/components/NavBottom";

const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: boolean }>([]);

  // Logique de filtrage (à personnaliser selon les besoins)
  const filteredDeliveries = deliveries.filter((delivery) => 
    delivery.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCardSelection = (id: string) => {
    setSelectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (id: string) => {
    console.log("Voir détails de la livraison: ", id);
  };

  useEffect(() => {
    // Simuler l'appel à Firestore ou obtenir les livraisons depuis un autre service
    const fetchDeliveries = async () => {
      // Exemple de données statiques
      const deliveriesData = [
        { id: "1", client: "Client A", address: "Adresse A", status: "Livré" },
        { id: "2", client: "Client B", address: "Adresse B", status: "En attente" },
        { id: "3", client: "Client C", address: "Adresse C", status: "Livré" },
      ];
      setDeliveries(deliveriesData);
    };
    fetchDeliveries();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar 
        deliveries={deliveries} 
        filterOptions={[
          "Toutes les livraisons",
          "Livrés",
          "Retours",
          "Échanges",
        ]}
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
              onViewDetails={handleViewDetails}
              onEditPickup={() => console.log("Modifier la livraison")}
            />
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

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
