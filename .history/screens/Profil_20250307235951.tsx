import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import Header from "../src/components/Header";
import InvoiceDocument from "../src/components/InvoiceDocument";
import NavBottom from "../src/components/NavBottom";

const Support: React.FC = () => {
  const navigation = useNavigation(); // Obtenir l'objet de navigation

  const [activeScreen, setActiveScreen] = useState("Support");
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <Header title="Tickets" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <InvoiceDocument />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          toggleButtonMode();
          navigation.navigate("AddTicket");
        }}
      >
        <Ionicons name={"add"} size={54} color="white" />
      </TouchableOpacity>
      <NavBottom activeScreen={activeScreen} />
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