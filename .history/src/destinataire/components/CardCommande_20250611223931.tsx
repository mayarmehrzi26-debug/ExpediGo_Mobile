import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CardCommandeProps {
  commande: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    date: string;
    client: {
      name: string;
      phone: string;
    };
  };
}

const CardCommande: React.FC<CardCommandeProps> = ({ commande }) => {
  const getStatusColor = () => {
    switch (commande.status) {
      case "Non traité": return "#FFA500"; // Orange
      case "En attente d'enlèvement": return "#5D8BF4"; // Blue
      case "Picked": return "#877DAB"; // Purple
      case "En cours de livraison": return "#4CAF50"; // Green
      case "Livré": return "#2E7D32"; // Dark Green
      case "Retour": return "#D32F2F"; // Red
      case "Annulée": return "#D32F2F"; // Gray
      case "Echange": return "#FFA500";
      default: return "#666"; // Default
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Commande #{commande.id}</Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor() + '20'}]}>
          <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {commande.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>{commande.origin}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="location-searching" size={16} color="#666" />
          <Text style={styles.detailText}>{commande.destination}</Text>
        </View>

        <View style={styles.dateRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.dateText}>{commande.date}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#44076a",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dateText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
});

export default CardCommande;