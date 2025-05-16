import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

interface Pickup {
  id: string;
  clientName: string;
  status: string;
  destination: string;
  payment: number;
  date: Timestamp;
  isExchange: boolean;
  isFragile: boolean;
}

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(firebasestore, "livraisons"),
        orderBy("date", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const pickupsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName || "Client inconnu",
          status: data.status || "En attente",
          destination: data.destination || "Adresse inconnue",
          payment: data.payment || 0,
          date: data.date,
          isExchange: data.isExchange || false,
          isFragile: data.isFragile || false,
        };
      });

      setPickups(pickupsList);
      setError(null);
    } catch (err) {
      console.error("Error fetching pickups:", err);
      setError("Erreur lors du chargement des pickups");
    } finally {
      setLoading(false);
    }
  };

  const renderPickupItem = ({ item }: { item: Pickup }) => (
    <View style={styles.pickupCard}>
      <View style={styles.pickupHeader}>
        <View style={styles.headerContent}>
          <View style={styles.idSection}>
            <TouchableOpacity style={styles.checkbox} />
            <View style={styles.idDetails}>
              <Text style={styles.idNumber}>{item.id}</Text>
              <Text style={styles.clientName}>{item.clientName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#A7A9B7" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pickupDetails}>
        <View style={styles.labels}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.label}>Paiement</Text>
          <Text style={styles.label}>Date</Text>
        </View>
        <View style={styles.values}>
          <View style={[styles.statusBadge, { backgroundColor: "#FF4E51" }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.destinationText}>{item.destination}</Text>
          <Text style={styles.paymentText}>{item.payment} DT</Text>
          <Text style={styles.dateText}>
            {item.date instanceof Timestamp
              ? item.date.toDate().toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date inconnue"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD5A1E" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPickups}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pickups}
          renderItem={renderPickupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF4E51",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FD5A1E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  pickupCard: {
    width: 340,
    marginBottom: 16,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pickupHeader: {
    height: 42,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#A7A9B7",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8.5,
    borderWidth: 2,
    borderColor: "#E1E1E2",
  },
  idDetails: {
    gap: -2,
  },
  idNumber: {
    color: "#1B2128",
    fontSize: 11,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  clientName: {
    color: "#27251F",
    fontSize: 8,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    lineHeight: 14,
  },
  menuButton: {
    width: 27,
    height: 27,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(167,169,183,0.46)",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  pickupDetails: {
    height: 98,
    padding: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labels: {
    gap: 10,
  },
  label: {
    color: "#959595",
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  values: {
    gap: 9,
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  destinationText: {
    color: "#1B2128",
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  paymentText: {
    color: "#FD5A1E",
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  dateText: {
    color: "#1B2128",
    fontSize: 9,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
});

export default Pickups;
