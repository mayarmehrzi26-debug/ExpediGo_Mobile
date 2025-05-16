import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/shared/NavBottom";
import FilterBar from "../../src/livraison/components/FilterBar";
import SearchBar from "../../src/livraison/components/SearchBar";
import DeliveryCard from "../livraison/components/DeliveryCard";
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
    const matchesSearch = 
      delivery.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === "Toutes les livraisons" || 
      delivery.status === filter ||
      (filter === "Échange" && delivery.isExchange);

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

  const handleCancelDelivery = async (id: string) => {
    try {
      const deliveryRef = doc(firebasestore, "livraisons", id);
      await updateDoc(deliveryRef, { status: "Annulée" });

      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((delivery) =>
          delivery.id === id ? { ...delivery, status: "Annulée" } : delivery
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'annulation de la livraison:", error);
    }
  };

  const canModifyOrCancel = (status: string): boolean => {
    return status === "Non traité" || status === "En attente d'enlèvement";
  };

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar 
        selectedFilter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          "Toutes les livraisons", "Non traité", "En attente d'enlèvement",
          "Picked", "Annulée", "En cours de livraison", "Livré", "Retour", "Échange"
        ]}
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
              onCancel={() => handleCancelDelivery(delivery.id)}
              showEditButton={canModifyOrCancel(delivery.status)}     // ✅ Bouton Modifier visible si statut ok
              showCancelButton={canModifyOrCancel(delivery.status)}   // ✅ Bouton Annuler visible si statut ok
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
