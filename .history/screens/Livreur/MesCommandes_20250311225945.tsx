import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig"; // Importation Firestore
import CommandeCard from "../../src/components/CommandeCard";
import FilterBar from "../../src/components/FilterBar";
import Header from "../../src/components/Header";
import LivExplorer from "../../src/components/LivExplorer";
import NavBottomHome from "../../src/components/NavBottomHome";

const MesCommandes: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("MesCommandes");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return delivery.status === "À livrer";
    if (activeFilter === "En cours de livraison") return delivery.status === "En cours de livraison";
    if (activeFilter === "Livrée") return delivery.status === "Livrée";
    if (activeFilter === "Annulée") return delivery.status === "Annulée";
    return true;
  });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);

        const deliveriesList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            origin: data.origin || "origine inconnue",
            destination: data.destination || "destination inconnue",
            date: data.date || "Date inconnue",
            status: data.status || "En attente",
          };
        });

        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={filteredDeliveries}
        filterOptions={["Toutes les commandes", "À livrer", "En cours de livraison", "Livrée", "Annulée"]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery, index) => (
            <CommandeCard key={index} delivery={delivery} />
          ))
        ) : (
          <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
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
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
  noOrders: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
});

export default MesCommandes;
