import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../../src/components/Header";

const PickupAddresses: React.FC = () => {
  const navigation = useNavigation(); // Obtenir l'objet de navigation




  return (
    <View style={styles.container}>
      <Header title="Adresses de pickup" showBackButton={true} />
      

      <ScrollView contentContainerStyle={styles.menuContainer}>
       
      </ScrollView>
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
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
  
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuText: {
    fontSize: 16,
    color: "#1B2128",
  },
});

export default PickupAddresses;