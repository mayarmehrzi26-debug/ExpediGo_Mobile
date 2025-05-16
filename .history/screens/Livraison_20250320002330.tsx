import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import FilterBar from "../src/components/FilterBar";
import FileExplorer from "../src/components/LivExplorer";
import NavBottom from "../src/components/NavBottom";

interface Livraison {
  id: string;
  client?: string;
  destination?: string;
  date?: string;
  status?: string;
}

const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [orders, setOrders] = useState<Livraison[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Toutes les livraisons");

  const openMenu = (id: string) => setMenuVisibleForId(id);
  const closeMenu = () => setMenuVisibleForId(null);

  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
        const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

        const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
        const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

        let formattedDate = "Date inconnue";
        if (data.createdAt instanceof Timestamp) {
          const dateObj = data.createdAt.toDate();
          formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (data.date) {
          formattedDate = data.date;
        }

        return {
          id: doc.id,
          client: clientData?.name || "Client inconnu",
          destination: addressData?.address || "Destination inconnue",
          date: formattedDate,
          status: data.status || "Statut inconnu", // Assurez-vous que le statut est inclus
        };
      }));

      setOrders(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
      const statusList = statusSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().nomStat,
      }));
      setStatuses(statusList);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    switch (activeFilter) {
      case "Toutes les livraisons":
        return true;
      case "En attente d'enlèvement":
        return order.status === "En attente";
      case "Annulé par admin":
        return order.status === "Annulé";
      default:
        return true;
    }
  });

  const searchedOrders = filteredOrders.filter((order) =>
    order.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={searchedOrders}
        onFilterChange={(filter) => setActiveFilter(filter)}
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
    backgroundColor: "#FD5A1E",
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