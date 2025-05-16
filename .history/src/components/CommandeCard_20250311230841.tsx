import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
}
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
  });

  // Séparer les commandes en fonction de leur statut
  const pendingDeliveries = deliveries.filter(delivery => delivery.status === "À livrer");
  const inProgressDeliveries = deliveries.filter(delivery => delivery.status === "En cours de livraison");
  const deliveredDeliveries = deliveries.filter(delivery => delivery.status === "Livrée");
  const cancelledDeliveries = deliveries.filter(delivery => delivery.status === "Annulée");

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={filteredDeliveries}
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
        {/* Section "À livrer" */}
        {pendingDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>À livrer</Text>
            {pendingDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "En cours de livraison" */}
        {inProgressDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>En cours de livraison</Text>
            {inProgressDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "Livrée" */}
        {deliveredDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Livrée</Text>
            {deliveredDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "Annulée" */}
        {cancelledDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Annulée</Text>
            {cancelledDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}
      </ScrollView>

      <NavBottomHome activeScreen={activeScreen} />
    </View>
  );
};const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#44076a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noOrders: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  statusOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    textAlign: "center",
  },
});

export default CommandeCard;