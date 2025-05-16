import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface Order {
  id: string;
  size: string;
  dimensions: string;
  quantity: number;
  totalPrice: number;
  timestamp: any;
}

const EmballageList: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(firebasestore, "orders"));
        const ordersData: Order[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.size}</Text>
      <Text style={styles.cell}>{item.dimensions}</Text>
      <Text style={styles.cell}>{item.quantity}</Text>
      <Text style={styles.cell}>{item.totalPrice.toFixed(2)} TND</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liste des commandes</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Taille</Text>
        <Text style={styles.headerCell}>Dimensions</Text>
        <Text style={styles.headerCell}>Quantité</Text>
        <Text style={styles.headerCell}>Total</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FD5A1E" style={styles.loadingIndicator} />
      ) : (
        <FlatList data={orders} renderItem={renderItem} keyExtractor={(item) => item.id} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#DDD",
    borderRadius: 8,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  loadingIndicator: {
    marginTop: 20,
    alignSelf: "center",
  },
});

export default EmballageList;