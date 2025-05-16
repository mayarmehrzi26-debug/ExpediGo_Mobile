import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);
        const deliveriesList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            client: data.client || "Client inconnu",
            address: data.address || "Adresse inconnue",
            payment: data.payment || "0 DT",
            date: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : "Date inconnue",
            status: data.status || "En attente",
          };
        });
        setDeliveries(deliveriesList);
        setFilteredDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };
    fetchDeliveries();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilteredDeliveries(deliveries.filter(delivery =>
      delivery.client.toLowerCase().includes(text.toLowerCase())
    ));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredDeliveries(deliveries);
    } else {
      setFilteredDeliveries(deliveries.filter(delivery => delivery.status.toLowerCase() === filter));
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => handleFilterChange("all")} style={activeFilter === "all" ? styles.activeFilter : styles.filterButton}><Text>Toutes les pickups</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("en attente")} style={activeFilter === "en attente" ? styles.activeFilter : styles.filterButton}><Text>En attente</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("annulé")} style={activeFilter === "annulé" ? styles.activeFilter : styles.filterButton}><Text>Annulé</Text></TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.map((delivery) => (
          <View key={delivery.id} style={styles.deliveryCard}>
            <Text style={styles.deliveryTitle}>{delivery.client}</Text>
            <Text style={styles.deliverySubtitle}>Destination: {delivery.address}</Text>
            <Text style={styles.deliverySubtitle}>Paiement: {delivery.payment}</Text>
            <Text style={styles.deliverySubtitle}>Date: {delivery.date}</Text>
            <Text style={[styles.status, delivery.status === "Annulé par vendeur" ? styles.statusCancelled : styles.statusNormal]}>{delivery.status}</Text>
          </View>
        ))}
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
    padding: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  filterButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeFilter: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#FF5A5F",
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
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
  status: {
    marginTop: 5,
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  statusCancelled: {
    backgroundColor: "#FF5A5F",
    color: "#fff",
  },
  statusNormal: {
    backgroundColor: "#54E598",
    color: "#fff",
  },
});

export default Pickups;
