import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Menu } from "react-native-paper";
import { firebasestore } from "../FirebaseConfig";
import FileExplorer from "../src/components/FileExplorer";
import FilterBar from "../src/components/FilterBar";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";
import StatusBadge from "../src/components/StatusBadge";

const getStatusColor = (status: string) => {
  switch (status) {
    case "En attente d'enlévement":
      return { backgroundColor: "#F06292", color: "#22C55E" };
    case "En cours de livraison":
      return { backgroundColor: "#DBEAFE", color: "#3B82F6" };
    case "Livré":
      return { backgroundColor: "#FEF9C3", color: "#F59E0B" };
    default:
      return { backgroundColor: "#F3F4F6", color: "#6B7280" };
  }
};

const Pickups: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<{ [key: number]: boolean }>(
    {}
  );
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState("Pickups");

  const openMenu = (id: string) => setMenuVisibleForId(id);
  const closeMenu = () => setMenuVisibleForId(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);
        const deliveriesList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const date =
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toLocaleDateString()
                : data.date || "Date inconnue";

            return {
              id: doc.id,
              client: data.client || "Client inconnu",
              address: data.address || "Adresse inconnue",
              product: data.product || "Produit inconnu",
              payment: data.totalAmount,
              date,
              status: data.status || "Entrée au centrale",
            };
          })
        );
        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id.toString().includes(searchQuery)
  );

  const toggleCardSelection = (id: number) => {
    setSelectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (delivery: any) => {
    navigation.navigate("PackageDetails", { scannedData: delivery.id });
  };

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />
      <View style={styles.separator1} />
      <FilterBar
        deliveries={deliveries}
        filterOptions={["Toutes les pickups", "En attente d'enlèvement", "Annulée"]}
      />
      <FileExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => toggleCardSelection(delivery.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedCards[delivery.id] && styles.checkboxChecked,
                    ]}
                  />
                </TouchableOpacity>
                <Text style={styles.deliveryId}>{delivery.id}</Text>
                <Menu
                  visible={menuVisibleForId === delivery.id}
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity onPress={() => openMenu(delivery.id)}>
                      <Entypo name="dots-three-vertical" size={20} color="black" />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => handleViewDetails(delivery)}
                    title="View details"
                  />
                  <Divider />
                  <Menu.Item
                    onPress={() => console.log("Edit pickup")}
                    title="Edit pickup"
                  />
                </Menu>
              </View>
              <Text style={styles.deliveryClient}>{delivery.client}</Text>
              <View style={styles.separator} />
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Status</Text>
                <StatusBadge
                  status={delivery.status}
                  backgroundColor={getStatusColor(delivery.status).backgroundColor}
                  textColor={getStatusColor(delivery.status).color}
                />
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Destination</Text>
                <Text style={styles.deliveryValue}>{delivery.address}</Text>
              </View>
            </View>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
    marginRight: 173,
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2128",
    marginTop: 5,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#877DAB",
    borderColor: "#877DAB",
  },
});

export default Pickups;
