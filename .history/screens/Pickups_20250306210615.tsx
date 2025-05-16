import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";

const Pickups: React.FC = () => {
  const navigation = useNavigation();
  const [deliveries, setDeliveries] = useState<any[]>([]); // Stores deliveries data

  // Fetch Deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "livraisons"));
      const deliveriesList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Include the document ID
      }));
      setDeliveries(deliveriesList); // Set the deliveries in the state
    };

    fetchDeliveries();
  }, []);

  // Handle item click (optional, for viewing more details)
  const handleItemClick = (deliveryId: string) => {
    navigation.navigate("DeliveryDetails", { deliveryId });
  };

  // Render Delivery Item
  const renderDeliveryItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.deliveryItem}
      onPress={() => handleItemClick(item.id)} // Navigate to details page on click
    >
      <Text style={styles.deliveryText}>Client: {item.client}</Text>
      <Text style={styles.deliveryText}>Adresse: {item.address}</Text>
      <Text style={styles.deliveryText}>Produit: {item.product}</Text>
      <Text style={styles.deliveryText}>Paiement: {item.payment}</Text>
      <Text style={styles.deliveryText}>Échange: {item.isExchange ? "Oui" : "Non"}</Text>
      <Text style={styles.deliveryText}>Fragile: {item.isFragile ? "Oui" : "Non"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Détails des Livraisons</Text>

      {/* FlatList for rendering deliveries */}
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={renderDeliveryItem}
        ListEmptyComponent={<Text>Aucune livraison trouvée</Text>}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F7F7",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 20,
  },
  deliveryItem: {
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deliveryText: {
    fontSize: 14,
    color: "#27251F",
    marginBottom: 5,
  },
});

export default Pickups;
