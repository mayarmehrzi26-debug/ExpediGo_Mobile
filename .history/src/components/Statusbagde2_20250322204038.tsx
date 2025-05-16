import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Statusbadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
      <Ionicons name="ellipse" size={10} color="#fff" style={styles.icon} />
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#877DAB", // Couleur par défaut
    borderRadius: 12, // Taille réduite
    paddingVertical: 3, // Réduction de la hauteur
    paddingHorizontal: 10, // Réduction de la largeur
  },
  icon: {
    marginRight: 5, // Espace entre l'icône et le texte
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12, // Texte légèrement plus petit
  },
});

export default Statusbadge2;
