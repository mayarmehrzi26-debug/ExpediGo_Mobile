import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(firebasestore, "Orders"));
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(orders);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const statuses = ["À livrer", "En cours de livraison", "Livrée", "Annulée"];

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={deliveries}
        filterOptions={["Toutes les commandes", ...statuses]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        {activeFilter === "Toutes les commandes"
          ? statuses.map((status) => {
              const filteredOrders = deliveries.filter(order => order.status === status);
              if (filteredOrders.length === 0) return null;
              return (
                <View key={status}>
                  <Text style={styles.sectionTitle}>{status}</Text>
                  {filteredOrders.map((order) => (
                    <CommandeCard key={order.id} order={order} />
                  ))}
                </View>
              );
            })
          : deliveries
              .filter(order => order.status === activeFilter)
              .map(order => <CommandeCard key={order.id} order={order} />)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B2128",
    marginVertical: 10,
  },
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default MesCommandes;
