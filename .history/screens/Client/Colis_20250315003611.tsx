import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CommandeCard from "../../src/components/CommandeCard";
import Header from "../../src/components/Header";
import NavBottomClient from "../../src/components/NavBottomClient";

const Colis: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Colis");
  

  return (
    <View style={styles.container}>
      <Header title="Mes colis" showBackButton={true} />
      <View style={styles.separator1} />

      <ScrollView contentContainerStyle={styles.content}>
        <CommandeCard></CommandeCard>
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
 
});

export default Colis;