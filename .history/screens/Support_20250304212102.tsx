import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct

const Support: React.FC = () => {
 
  const [activeScreen, setActiveScreen] = useState("HomeScreen");
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
    </View>
      </ScrollView>

      {/* Barre de navigation en bas */}
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
  description: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
  },
  image: {
    aspectRatio: 1,
    width: '20%',
    borderRadius: 192,
    backgroundColor: "#A7A9B7",

  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20, // Pour que le bouton s'intègre dans la Bottom Nav
  },
});

export default Support;