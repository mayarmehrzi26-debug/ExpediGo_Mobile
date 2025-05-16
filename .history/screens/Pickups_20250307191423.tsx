import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import FileExplorer from "../src/components/FileExplorer";
import FilterOption from "../src/components/FilterOption";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";
import PickupItem from "../src/components/PickupItem";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const extractNumericId = (id: string, length: number = 3): number => {
    const numericString = id.replace(/\D/g, "").slice(0, length);
    return numericString ? parseInt(numericString, 10) : 0;
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);

        const deliveriesList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();

            const productSnapshot = await getDocs(collection(firebasestore, "products"));
            const productData = productSnapshot.docs.find((productDoc) => productDoc.id === data.product)?.data();

            const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
            const clientData = clientSnapshot.docs.find((clientDoc) => clientDoc.id === data.client)?.data();

            const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
            const addressData = addressSnapshot.docs.find((addressDoc) => addressDoc.id === data.address)?.data();

            const date =
              data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : data.date || "Date inconnue";

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
      delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) || delivery.id.toString().includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterOption />
      <FileExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <View style={styles.separator1} />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => <PickupItem key={delivery.id} delivery={delivery} />)
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
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 20,
  },
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default Pickups;
