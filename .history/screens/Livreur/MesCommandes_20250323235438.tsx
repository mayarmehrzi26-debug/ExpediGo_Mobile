import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CommandeCard from "../../src/components/CommandeCard";
import FilterBar from "../../src/components/FilterBar";
import Header from "../../src/components/Header";
import LivExplorer from "../../src/components/LivExplorer";
import NavBottomHome from "../../src/components/NavBottomHome";

const MesCommandes: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("MesCommandes");
  const [deliveries, setDeliveries] = useState<any[]>([
    // Exemple de données fictives
    { id: 1, client: "Client A", status: "À livrer" },
    { id: 2, client: "Client B", status: "Livrée" },
    { id: 3, client: "Client C", status: "En cours de livraison" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredDeliveries = deliveries
    .filter((delivery) => {
      if (activeFilter === "Toutes les commandes") return true;
      if (activeFilter === "À livrer") return delivery.status === "À livrer";
      if (activeFilter === "En cours de livraison") return delivery.status === "En cours de livraison";
      if (activeFilter === "Livrée") return delivery.status === "Livrée";
      if (activeFilter === "Annulée") return delivery.status === "Annulée";
      return true;
    })
    .filter(
      (delivery) =>
        delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.id.toString().includes(searchQuery)
    );

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={filteredDeliveries} // Passez les livraisons filtrées à la barre de filtre
        filterOptions={[
          "Toutes les commandes",
          "À livrer",
          "En cours de livraison",
          "Livrée",
        ]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Affichage du compteur */}
      <Text style={styles.counter}>
        {filteredDeliveries.length} résultat
        {filteredDeliveries.length > 1 ? "s" : ""} trouvé
        {filteredDeliveries.length > 1 ? "s" : ""}
      </Text>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <CommandeCard key={delivery.id} delivery={delivery} />
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune commande trouvée.</Text>
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
  counter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
    marginLeft: 20,
    marginBottom: 10,
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
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
  separator1: {
    height: 1,
    backgroundColor: "#44076a",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default MesCommandes;
