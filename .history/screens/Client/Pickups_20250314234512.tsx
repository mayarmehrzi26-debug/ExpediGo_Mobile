import { Entypo } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Divider, Menu, Modal } from "react-native-paper";
import { firebasestore } from "../../FirebaseConfig";
import FileExplorer from "../../src/components/FileExplorer";
import FilterBar from "../../src/components/FilterBar";
import Header from "../.../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<{ [key: number]: boolean }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState<any[]>([]);

  const openMenu = (id: string) => setMenuVisibleForId(id);
  const closeMenu = () => setMenuVisibleForId(null);

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
    delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.id.toString().includes(searchQuery)
  );

  const toggleCardSelection = (id: number) => {
    setSelectedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.keys(selectedCards).length === filteredDeliveries.length && Object.values(selectedCards).every(selected => selected);
    const newSelection = filteredDeliveries.reduce((acc, delivery) => {
      acc[delivery.id] = !allSelected;
      return acc;
    }, {});
    setSelectedCards(newSelection);
  };

  const handleExport = () => {
    const deliveriesToExport = filteredDeliveries.filter(delivery => selectedCards[delivery.id]);
    setSelectedDeliveries(deliveriesToExport);
    setModalVisible(true);
  };

  const exportToPDF = async () => {
    const html = selectedDeliveries.map(delivery => `
      <h1>Delivery ID: ${delivery.id}</h1>
      <p>Client: ${delivery.client}</p>
      <p>Address: ${delivery.address}</p>
      <p>Payment: ${delivery.payment} DT</p>
      <p>Date: ${delivery.date}</p>
      <hr/>
    `).join('');

    try {
      // Generate the PDF
      const { uri } = await Print.printToFileAsync({ html });

      // Define the path to the Downloads folder
      const downloadsDir = `${FileSystem.documentDirectory}downloads/`;
      await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });

      const fileName = `Delivery_${new Date().toISOString()}.pdf`;
      const fileUri = downloadsDir + fileName;

      // Move the file to the Downloads folder
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      // Share the PDF
      await Sharing.shareAsync(fileUri);

      Alert.alert("PDF Saved", `File saved to: ${fileUri}`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar 
        deliveries={deliveries} 
        filterOptions={[
          "Toutes les commandes", 
          "À livrer", 
          "En cours de livraison", 
          "Livrée", 
          "Annulée"
        ]}
      />
      <FileExplorer 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        toggleSelectAll={toggleSelectAll}
        exportSelectedDeliveries={handleExport} // Pass the export function
      />

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={() => toggleCardSelection(delivery.id)}>
                  <View style={[styles.checkbox, selectedCards[delivery.id] && styles.checkboxChecked]} />
                </TouchableOpacity>
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
                <Text style={styles.statusBadge}>Entrée au centrale</Text>
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

      <NavBottom activeScreen={activeScreen} />

      {/* Modal for Export Confirmation */}
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text>Voulez-vous exporter en PDF ?</Text>
          <Button mode="contained" onPress={exportToPDF}>Export</Button>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
        </View>
      </Modal>
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
    paddingTop: 5,
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
  modalContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Pickups;