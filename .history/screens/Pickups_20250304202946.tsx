import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("HomeScreen");

  return (
    <View style={styles.container}>
<Header title="Nouvelle livraison" showBackButton={true} />

      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue sur l'écran d'accueil</Text>
        <Text style={styles.description}>
          Ceci est un exemple de page utilisant le composant NavBottom.
        </Text>
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
});

export default Pickups;