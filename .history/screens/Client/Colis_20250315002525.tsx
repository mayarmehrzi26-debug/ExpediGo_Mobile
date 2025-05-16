import { Entypo } from "@expo/vector-icons";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Divider, Menu } from "react-native-paper";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
import NavBottomClient from "../../src/components/NavBottomClient";
import StatusBadge from "../../src/components/StatusBadge";

const Colis: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Colis");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null);

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
            const productSnapshot = await getDocs(collection(firebasestore, "products"));
            const productData = productSnapshot.docs.find(productDoc => productDoc.id === data.product)?.data();

            const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
            const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

            const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
            const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();
            const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
            const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

            const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : "Date inconnue";
            const id = doc.id;

            return {
              id,
              client: clientData?.name || "Client inconnu",
              address: addressData?.address || "Adresse inconnue",
              product: productData?.name || "Produit inconnu",
              payment: productData?.amount,
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

  return (
    <View style={styles.container}>
      <Header title="Mes colis" showBackButton={true} />
      <View style={styles.separator1} />

      <ScrollView contentContainerStyle={styles.content}>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.cardHeader}>
               
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
                  <Menu.Item onPress={() => console.log("View details")} title="View details" />
                  <Divider />
                  <Menu.Item onPress={() => console.log("Edit pickup")} title="Edit pickup" />
                </Menu>
              </View>
              <Text style={styles.deliveryClient}>{delivery.client}</Text>
              <View style={styles.separator} />
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Status</Text>
<StatusBadge/>            
  </View>
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Destination</Text>
                <Text style={styles.deliveryValue}>{delivery.address}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Paiement</Text>
                <Text style={styles.deliveryPayment}>{delivery.payment} DT</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.deliverySubtitle}>Date</Text>
                <Text style={styles.deliveryValue}>{delivery.date}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      <NavBottomClient activeScreen={activeScreen} />
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
    paddingHorizontal: 9,
    borderRadius: 30,
    fontSize: 12,
    paddingVertical: 5,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#54E598',
    borderColor: '#54E598',
  },
  deliveryPayment: {
    fontSize: 14,
    color: "#FD5A1E",
    fontWeight: "bold",
    marginTop: 5,
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
  deliveryValue: {
    fontSize: 14,
    color: "#1B2128",
    fontWeight: "bold",
  },
});

export default Colis;