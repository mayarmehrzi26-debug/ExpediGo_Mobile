import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CommandeCard from "../../src/components/CommandeCard";
import FilterBar from "../../src/components/FilterBar";
import Header from "../../src/components/Header";
import LivExplorer from "../../src/components/LivExplorer";
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";

const MesCommandes: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("MesCommandes");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");
  const navigation = useNavigation(); // Utilisez le hook useNavigation

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return delivery.status === "À livrer";
    if (activeFilter === "En cours de livraison") return delivery.status === "En cours de livraison";
    if (activeFilter === "Livrée") return delivery.status === "Livrée";
    return true;
  }).filter(delivery =>
    delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.id.toString().includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <Header title="Les Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

     

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        <CommandeCard navigation={navigation} /> 
      </ScrollView>

      <NavBottomLiv />
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
    backgroundColor: "#44076a",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default MesCommandes;