import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { updateLivraisonStatus } from "../services/commandeService";

interface CardProps {
  commande: {
    id: string;
    type?: string;
    origin?: string;
    destination?: string;
    date?: string;
    status?: string;
  };
  onRefresh: () => void;
}

const CardCommande: React.FC<CardProps> = ({ commande, onRefresh }) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStatusUpdate = async (newStatus: string) => {
    const success = await updateLivraisonStatus(commande.id, newStatus);
    if (success) {
      onRefresh();
    }
  };

  const handleAction = async () => {
    switch (commande.status) {
      case "Non traité":
        await handleStatusUpdate("En attente d'enlèvement");
        break;
      case "En attente d'enlèvement":
        await handleStatusUpdate("En cours de pickup");
        break;
      case "En cours de pickup":
        await handleStatusUpdate("Picked");
        break;
      case "Picked":
        await handleStatusUpdate("En cours de livraison");
        break;
      case "En cours de livraison":
        showDeliveryConfirmation();
        break;
      default:
        return;
    }
  };

  const showDeliveryConfirmation = () => {
    Alert.alert(
      "Confirmation de livraison",
      "Avez-vous remis le colis au destinataire ?",
      [
        {
          text: "Oui, livraison réussie",
          onPress: () => handleStatusUpdate("Livré"),
        },
        {
          text: "Non, retour ou échange",
          onPress: () => handleStatusUpdate("Retour"),
          style: "destructive",
        },
      ]
    );
  };

  const getButtonText = () => {
    switch (commande.status) {
      case "Non traité": return "Prendre la commande";
      case "En attente d'enlèvement": return "Commencer le pickup";
      case "En cours de pickup": return "Terminer le pickup";
      case "Picked": return "Commencer la livraison";
      case "En cours de livraison": return "Terminer la livraison";
      default: return "";
    }
  };

  const shouldShowButton = () => {
    return ["Non traité", "En attente d'enlèvement", "En cours de pickup", "Picked", "En cours de livraison"].includes(commande.status || "");
  };

  const getStatusColor = () => {
    switch (commande.status) {
      case "Non traité": return "#FFA500"; // Orange
      case "En attente d'enlèvement": return "#877DAB"; // Blue
      case "En cours de pickup": return "#FFC107"; // Amber
      case "Picked": return "#877DAB"; // Purple
      case "En cours de livraison": return "#4CAF50"; // Green
      case "Livré": return "#D32F2F"; // Dark Green
      case "Retour": return "#D32F2F"; // Red
      default: return "#666"; // Gray
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.title}>
            {commande.type === "livraison" 
              ? `Livraison #${commande.id}` 
              : `Commande #${commande.id}`}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor() + '20'}]}>
            <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
            <Text style={[styles.statusText, {color: getStatusColor()}]}>
              {commande.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.value}>{commande.origin}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="location-searching" size={16} color="#666" />
          <Text style={styles.value}>{commande.destination}</Text>
        </View>

        <View style={styles.dateRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.dateText}>{commande.date}</Text>
        </View>
      </View>

      {shouldShowButton() && (
        <TouchableOpacity 
          style={[
            styles.button,
            {backgroundColor: getStatusColor()}
          ]}
          onPress={handleAction}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  value: {
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
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CardCommande;