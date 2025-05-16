import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";


interface Order {
  id: string;
  size: string;
  dimensions: string;
  quantity: number;
  totalPrice: number;
  timestamp: any;
}

interface EmballageListProps {
  navigation: any; // Vous pouvez remplacer `any` par le type approprié pour votre navigation
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
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>

        
      </View>

       
      <View style={styles.container}>
     
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Taille</Text>
        <Text style={styles.headerCell}>Dimensions</Text>
        <Text style={styles.headerCell}>Quantité</Text>
        <Text style={styles.headerCell}>Total</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : (
        <FlatList data={orders} renderItem={renderItem} keyExtractor={(item) => item.id} />
      )}
    </View>

      </ScrollView>

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
          <Ionicons name={"add"} size={54} color="white" />
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
    justifyContent: "space-between",
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
    fontFamily: "Avenir",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  headerImage: {
    width: 46,
    height: 46,
    paddingTop: 12,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  sizesContainer: {
    gap: 9,
  },
  sizeOption: {
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D4D4D4",
  },
  selectedSizeOption: {
    borderColor: "#FD5A1E",
  },
  disabledSizeOption: {
    opacity: 0.5,
  },
  sizeOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedSizeLabel: {
    color: "#FD5A1E",
  },
  sizeDimensions: {
    color: "#27251F",
    fontSize: 14,
    textAlign: "right",
  },
  selectedSizeDimensions: {
    color: "#FD5A1E",
  },
  disabledText: {
    color: "#D4D4D4",
  },
  quantitySection: {
    marginTop: 17,
  },
  quantityInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    height: 42,
    paddingHorizontal: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(167, 169, 183, 0.21)",
    marginVertical: 17,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  priceLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 28,
  },
  priceValues: {
    alignItems: "flex-end",
  },
  priceValue: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 28,
  },
  orderButton: {
    backgroundColor: "#FD5A1E",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 70,
    marginTop: 72,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  bottomNavItem: {
    alignItems: "center",
    width: 38,
    height: 43,
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  modalDetails: {
    fontSize: 14,
    color: "#27251F",
    marginVertical: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#FD5A1E",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "600",
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
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default EmballageList;