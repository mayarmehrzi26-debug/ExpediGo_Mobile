import React from "react";
import { Text, StyleSheet, View } from "react-native";

const statusBadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#54E598", // Couleur par défaut
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StatusBadge2;