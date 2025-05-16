import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface Order {
  id: string;
  size: string;
  quantity: number;
  totalPrice: number;
  price: number;

  timestamp: any;
}

interface EmballageListProps {
  navigation: any;
}

const EmballageList: React.FC<EmballageListProps> = ({ navigation }) => {
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

      <Text style={styles.cell}>{item.size}</Text>
      <Text style={styles.cell}>{item.quantity}</Text>
            <Text style={styles.cell}>{item.price}</Text>

      <Text style={styles.cell}>{item.totalPrice.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>
      </View>

      <View style={styles.tableHeader}>
      <Text style={styles.headerCell}>Taille</Text>

        <Text style={styles.headerCell}>Taille</Text>
        <Text style={styles.headerCell}>Quantité</Text>
        <Text style={styles.headerCell}>PU</Text>
        <Text style={styles.headerCell}>PT</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FD5A1E" style={styles.loadingIndicator} />
      ) : (
        <FlatList data={orders} renderItem={renderItem} keyExtractor={(item) => item.id} />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="cube-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Pickups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="bicycle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Livraisons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name="add" size={54} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="help-circle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="person-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Profil</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 51,
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
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
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
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  bottomNavItem: {
    alignItems: "center",
  },
  bottomNavText: {
    marginTop: 4,
    fontSize: 7,
    color: "#27251F",
    fontWeight: "800",
    textAlign: "center",
  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
});

export default EmballageList;