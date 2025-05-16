import * as Sharing from 'expo-sharing';
import React, { useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";

const FileExplorer = ({ selectedDeliveries }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const generatePDF = async () => {
    try {
      let htmlContent = `
        <h1>Liste des livraisons</h1>
        <table border="1" width="100%" style="border-collapse: collapse; text-align: left;">
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Adresse</th>
            <th>Produit</th>
            <th>Paiement</th>
            <th>Date</th>
          </tr>
          ${selectedDeliveries.map(delivery => `
            <tr>
              <td>${delivery.id}</td>
              <td>${delivery.client}</td>
              <td>${delivery.address}</td>
              <td>${delivery.product}</td>
              <td>${delivery.payment} DT</td>
              <td>${delivery.date}</td>
            </tr>
          `).join('')}
        </table>
      `;

      const pdfOptions = {
        html: htmlContent,
        fileName: "livraisons",
        directory: "Documents",
      };

      const file = await RNHTMLtoPDF.convert(pdfOptions);
      const filePath = file.filePath;

      Alert.alert("Succès", "Le PDF a été généré avec succès.", [
        { text: "OK", onPress: () => sharePDF(filePath) }
      ]);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    }
  };

  const sharePDF = async (filePath) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil.");
      return;
    }
    await Sharing.shareAsync(filePath);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text>Exporter en PDF</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <Text>Vous voulez exporter en PDF ?</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); generatePDF(); }}>
              <Text>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text>Non</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FileExplorer = ({ searchQuery, setSearchQuery, toggleSelectAll, exportSelectedDeliveries }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCheckboxToggle = () => {
    setIsChecked((prev) => !prev);
    toggleSelectAll();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleCheckboxToggle} style={styles.checkbox}>
        <View style={[styles.checkboxInner, isChecked && styles.checkboxChecked]} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-green.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-grey.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-empty.png")} style={styles.icon} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={15} color="#FF6B6B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <Text>Vous voulez exporter en PDF ?</Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); exportSelectedDeliveries(); }}>
              <Text>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text>Non</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FileExplorer;
