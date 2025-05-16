import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firebasestore } from "../FirebaseConfig";
import { EmballageOrder } from "./model/emballage.model";

const EmballageList = ({ navigation }) => {
  const [orders, setOrders] = useState<EmballageOrder[]>([]);

  useEffect(() => {
    const q = query(collection(firebasestore, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: EmballageOrder[] = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
        } as EmballageOrder);
      });
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "non traité":
        return "#FFA500"; // Orange
      case "en cours":
        return "#1E90FF"; // DodgerBlue
      case "traité":
        return "#32CD32"; // LimeGreen
      default:
        return "#A7A9B7"; // Grey
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique des commandes</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Taille</Text>
            <Text style={styles.headerText}>Quantité</Text>
            <Text style={styles.headerText}>Total</Text>
            <Text style={styles.headerText}>Statut</Text>
          </View>

          {orders.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <Text style={styles.cellText}>{order.size}</Text>
              <Text style={styles.cellText}>{order.quantity}</Text>
              <Text style={styles.cellText}>{order.totalPrice.toFixed(2)} DT</Text>
              <View style={[styles.statusCell, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 31,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontFamily: "Avenir",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  table: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#877DAB",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerText: {
    flex: 1,
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  cellText: {
    flex: 1,
    textAlign: "center",
  },
  statusCell: {
    flex: 1,
    borderRadius: 4,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default EmballageList;