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

  // Séparez les commandes en fonction de leur statut
  const groupedDeliveries = deliveries.reduce((acc, delivery) => {
    const status = delivery.status || "Statut inconnu";
    if (!acc[status]) acc[status] = [];
    acc[status].push(delivery);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={deliveries}
        filterOptions={[
          "Toutes les commandes",
          "À livrer",
          "En cours de livraison",
          "Livrée",
          "Annulée"
        ]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Affichez les sections pour chaque statut */}
        {Object.keys(groupedDeliveries).map((status) => {
          const filtered = groupedDeliveries[status].filter((delivery) => {
            if (activeFilter === "Toutes les commandes") return true;
            return delivery.status === activeFilter;
          });

          if (filtered.length > 0) {
            return (
              <View key={status}>
                <Text style={styles.statusSectionTitle}>{status}</Text>
                {filtered.map((delivery) => (
                  <CommandeCard key={delivery.id} />
                ))}
              </View>
            );
          }
          return null;
        })}
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
  statusSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#44076a",
    marginTop: 20,
    marginBottom: 10,
  },
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
});
