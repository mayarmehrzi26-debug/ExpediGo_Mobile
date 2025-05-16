import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import DeliveryCard from "../../src/components/DeliveryCard";
import FilterBar from "../../src/components/FilterBar";
import Header from "../../src/components/Header";
import SearchBar from "../../src/components/SearchBar";
import NavBottom from "../../src/components/shared/NavBottom";
import { LivraisonModel } from "../livraison/models/Livraison";

const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: boolean }>({});
  const [filter, setFilter] = useState("Toutes les livraisons");
  const navigation = useNavigation();
  const [presenter] = useState(new LivraisonModel());

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
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

  const filteredDeliveries = deliveries.filter((delivery) => {
    // Filtre par recherche
    const matchesSearch = 
      delivery.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre par statut
    const matchesFilter = 
      filter === "Toutes les livraisons" || 
      delivery.status === filter;

    return matchesSearch && matchesFilter;
  });

  const toggleCardSelection = (id: string) => {
    setSelectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (id: string) => {
    navigation.navigate("PackageDetails", { deliveryId: id });
  };

  const handleEditPickup = (id: string) => {
    navigation.navigate("EditLivraison", { deliveryId: id });
  };

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar 
        selectedFilter={filter}
        onFilterChange={setFilter}
        filterOptions={["Toutes les livraisons", "En attente", "En cours", "Livré", "Retour", "Échange"]}
      />

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rechercher une livraison..."
      />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              id={delivery.id}
              client={delivery.client}
              address={delivery.address}
              status={delivery.status}
              date={delivery.createdAt?.toDate?.() || new Date()}
              isSelected={selectedCards[delivery.id]}
              onToggleSelection={toggleCardSelection}
              onViewDetails={() => handleViewDetails(delivery.id)}
              onEditPickup={() => handleEditPickup(delivery.id)}
            />
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      <NavBottom activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
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
    marginTop: 20,
  },
  separator1: {
    height: 1,
    backgroundColor: "#877DAB",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default Livraison;