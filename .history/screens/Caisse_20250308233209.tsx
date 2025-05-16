import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import Header from "../src/components/Header";
const Caisse: React.FC = () => {



  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      

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

export default Caisse;