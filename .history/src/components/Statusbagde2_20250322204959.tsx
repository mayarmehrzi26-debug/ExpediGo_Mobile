import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Statusbadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
      <Ionicons name="ellipse" size={6} color="#fff" style={styles.icon} />
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#877DAB", 
    borderRadius: 12, 
    paddingVertical: 3, 
    paddingHorizontal: 10,
    marginLeft:60,
    marginRight:23

  },
  icon: {
    marginRight: 7, 
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default Statusbadge2;
