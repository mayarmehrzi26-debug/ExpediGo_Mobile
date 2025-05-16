import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import RNFS from "react-native-fs";
import * as XLSX from "xlsx";
import { firebasestore } from "../FirebaseConfig";
import FileExplorer from "../src/components/FileExplorer";
import FilterBar from "../src/components/FilterBar";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCards, setSelectedCards] = useState({});

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);
        const deliveriesList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            client: data.client || "Client inconnu",
            address: data.address || "Adresse inconnue",
            product: data.product || "Produit inconnu",
            payment: data.payment || "Non spécifié",
            date: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : "Date inconnue",
          };
        });

        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des livraisons :", error);
      }
    };

    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      (delivery.client && delivery.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (delivery.id && delivery.id.toString().includes(searchQuery))
  );

  const toggleSelectAll = () => {
    const allSelected = filteredDeliveries.every((delivery) => selectedCards[delivery.id]);
    const newSelection = {};
    filteredDeliveries.forEach((delivery) => {
      newSelection[delivery.id] = !allSelected;
    });
    setSelectedCards(newSelection);
  };

  const exportSelectedDeliveriesToExcel = async () => {
    const selectedDeliveries = deliveries.filter((delivery) => selectedCards[delivery.id]);
    if (selectedDeliveries.length === 0) {
      Alert.alert("Aucune livraison sélectionnée", "Veuillez sélectionner au moins une livraison.");
      return;
    }

    const dataForExcel = selectedDeliveries.map((delivery) => ({
      ID: delivery.id,
      Client: delivery.client,
      Adresse: delivery.address,
      Produit: delivery.product,
      Paiement: delivery.payment,
      Date: delivery.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Livraisons");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    const filePath = `${RNFS.DocumentDirectoryPath}/livraisons_export.xlsx`;

    try {
      await RNFS.writeFile(filePath, excelBuffer, "ascii");
      Alert.alert("Export réussi", `Fichier enregistré : ${filePath}`);
    } catch (error) {
      console.error("Erreur d'export :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'export.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton />
      <FilterBar deliveries={deliveries} filterOptions={["Toutes", "À livrer", "En cours", "Livrée", "Annulée"]} />
      <FileExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} toggleSelectAll={toggleSelectAll} exportSelectedDeliveries={exportSelectedDeliveriesToExcel} />

      <ScrollView>
        {filteredDeliveries.map((delivery) => (
          <View key={delivery.id} style={styles.card}>
            <Text>{delivery.client} - {delivery.address}</Text>
          </View>
        ))}
      </ScrollView>

      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F7F7F7" }, card: { padding: 10, backgroundColor: "white", margin: 10 } });

export default Pickups;
