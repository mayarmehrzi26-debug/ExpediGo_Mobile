import { Entypo } from "@expo/vector-icons";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { Button, Divider, Menu, Modal } from "react-native-paper";
import { firebasestore } from "../FirebaseConfig";
import FileExplorer from "../src/components/FileExplorer";
import FilterBar from "../src/components/FilterBar";
import Header from "../src/components/Header";
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

    const options = {
      html,
      fileName: 'Deliveries',
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert("PDF Exported", `File saved to: ${file.filePath}`);
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
  // ... [existing styles]
  modalContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Pickups;