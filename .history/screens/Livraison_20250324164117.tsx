import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import FilterBar from "../src/components/FilterBar";
import Header from "../src/components/Header";
import FileExplorer from "../src/components/LivExplorer";
import NavBottom from "../src/components/NavBottom";


const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);


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
        
      </ScrollView>

      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

// Styles inchangés
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
  deliveryValue: {
    fontSize: 14,
    color: "#1B2128",
    fontWeight: "bold",
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
});

export default Livraison;