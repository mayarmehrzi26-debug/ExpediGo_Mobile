import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LivraisonCardProps {
  id: string;
  destinataire: string;
  adresse: string;
  statut: string;
  onPress?: () => void;
}

const LivraisonCard: React.FC<LivraisonCardProps> = ({
  id,
  destinataire,
  adresse,
  statut,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Ionicons name="cube" size={20} color="#4CAF50" style={styles.icon} />
        <Text style={styles.destinataire}>{destinataire}</Text>
      </View>
      <Text style={styles.adresse}>{adresse}</Text>
      <View style={styles.statutContainer}>
        <Text style={[styles.statut, getStatusStyle(statut)]}>{statut}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStatusStyle = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "en cours":
      return { color: "#FFA000" };
    case "livré":
      return { color: "#4CAF50" };
    case "annulé":
      return { color: "#F44336" };
    default:
      return { color: "#757575" };
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  destinataire: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  adresse: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  statutContainer: {
    marginTop: 4,
  },
  statut: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LivraisonCard;
