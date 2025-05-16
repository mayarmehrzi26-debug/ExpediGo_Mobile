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
 
  
  
 
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
 
});

export default Colis;