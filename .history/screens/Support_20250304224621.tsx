import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct
import InvoiceDocument from "../src/components/InvoiceDocument";
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct
const Support: React.FC = () => {
 
  const [activeScreen, setActiveScreen] = useState("HomeScreen");
   const [modalVisible, setModalVisible] = useState(false);
    const [isAddMode, setIsAddMode] = useState(true); // État pour suivre le mode du bouton
  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode); // Inversez le mode du bouton
    setModalVisible(!modalVisible); // Ouvrir ou fermer le modal
  };
  return (
    <View style={styles.container}>
<Header title="Tickets" showBackButton={true} />
      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>

      <View style={styles.container}>
        <InvoiceDocument/> 
       </View>

      </ScrollView>
      <TouchableOpacity
          style={styles.floatingButton}
          onPress={toggleButtonMode}
        >
          <Ionicons
            name={"add" } 
            size={54}
            color="white"
          />
        </TouchableOpacity>
      {/* Barre de navigation en bas */}
      <NavBottom activeScreen={activeScreen} />
       <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsAddMode(true); // Réinitialiser le bouton en mode "+"
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text></Text>
          </View>
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add slight transparency for better visibility
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop:393, 


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
 
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#54E598",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30, 
    marginLeft: 350, // Pour que le bouton s'intègre dans la Bottom Nav
    
  },
});

export default Support;