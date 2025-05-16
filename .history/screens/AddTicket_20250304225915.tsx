import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct
import InvoiceDocument from "../src/components/InvoiceDocument";
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct
const AddTicket: React.FC = () => {
 
  const [activeScreen, setActiveScreen] = useState("HomeScreen");
   const [modalVisible, setModalVisible] = useState(false);
    const [isAddMode, setIsAddMode] = useState(true); // État pour suivre le mode du bouton
  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode); // Inversez le mode du bouton
    setModalVisible(!modalVisible); // Ouvrir ou fermer le modal
  };
  return (
    <View style={styles.container}>
<Header title="Ajouter un nouveau ticket" showBackButton={true} />
      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>

      <View style={styles.container}>
           <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paiement</Text>
                <CustomDropdown
                  placeholder="Sélectionnez le statut du paiement"
                  options={PaiementOptions}
                  onSelect={(value) => setSelectedPayment(value)}
                  selectedValue={selectedPayment}
                />
              </View>
       </View>

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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
 
  
});

export default AddTicket;