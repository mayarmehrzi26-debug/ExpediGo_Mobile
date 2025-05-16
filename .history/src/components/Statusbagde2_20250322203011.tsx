import React from "react";
import { Circle,StyleSheet, Text, View } from "react-native";

const Statusbadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
            <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      
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

export default Statusbadge2;