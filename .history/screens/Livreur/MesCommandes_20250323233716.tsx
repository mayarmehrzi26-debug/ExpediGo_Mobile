import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return delivery.status === "À livrer";
    if (activeFilter === "En cours de livraison") return delivery.status === "En cours de livraison";
    if (activeFilter === "Livrée") return delivery.status === "Livrée";
    if (activeFilter === "Annulée") return delivery.status === "Annulée";
    return true;
  }).filter(delivery =>
    delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.id.toString().includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        filterOptions={[
          "Toutes les commandes",
          "À livrer",
          "En cours de livraison",
          "Livrée",
        ]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        <CommandeCard />
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
  },
  statusBadge: {
    backgroundColor: "#54E598",
    color: "#fff",
    paddingHorizontal: 9,
    borderRadius: 30,
    fontSize: 12,
    paddingTop: 5,
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2128",
    marginTop: 5,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: "#A7A9B7",
    marginTop: 5,
  },
  iconContainer: {
    marginTop: 11,
  },
  deliveryPayment: {
    fontSize: 14,
    color: "#44076a",
    fontWeight: "bold",
    marginTop: 5,
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
    backgroundColor: "#44076a",
    marginVertical: 8,
    marginBottom: 22,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  deliveryValue: {
    fontSize: 14,
    color: "#1B2128",
    fontWeight: "bold",
  },
});

export default MesCommandes;