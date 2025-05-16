import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  const extractNumericId = (id: string, length: number = 3): number => {
    const numericString = id.replace(/\D/g, "");
    const truncatedString = numericString.slice(0, length);
    return truncatedString ? parseInt(truncatedString, 10) : 0;
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);

        const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          const productSnapshot = await getDocs(collection(firebasestore, "products"));
          const productData = productSnapshot.docs.find(productDoc => productDoc.id === data.product)?.data();

          const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
          const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

          const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
          const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

          const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : data.date || "Date inconnue";
          const numericId = extractNumericId(doc.id);

          return {
            id: numericId,
            client: clientData?.name || "Client inconnu",
            address: addressData?.address || "Adresse inconnue",
            product: productData?.name || "Produit inconnu",
            payment: productData?.amount,
            isExchange: data.isExchange,
            isFragile: data.isFragile,
            productImage: productData?.imageUrl || null,
            date,
          };
        }));

        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.client.toLowerCase().includes(searchText.toLowerCase()) ||
    delivery.id.toString().includes(searchText)
  );

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />
      <View style={styles.separator1} />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={15} color="#FF6B6B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par ID ou client"
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.separator1} />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.deliveryId}>{delivery.id}</Text>
                <Text style={styles.statusBadge}>En attente</Text>
              </View>
              <Text style={styles.deliveryClient}>{delivery.client}</Text>
              <View style={styles.separator} />

              <Text style={styles.deliverySubtitle}>Destination: {delivery.address}</Text>
              <Text style={styles.deliveryPayment}>Paiement: {delivery.payment} DT</Text>
              <Text style={styles.deliveryDate}>Date: {delivery.date}</Text>

              {delivery.isFragile && <Text style={styles.fragileBadge}>Colis fragile</Text>}

              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Voir les détails</Text>
              </TouchableOpacity>
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
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: "#1F2937",
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
  statusBadge: {
    backgroundColor: "#54E598",
    color: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2128",
    marginTop: 5,
  },
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default Pickups;
