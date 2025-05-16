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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {commande.type === "livraison" 
            ? `Livraison #${commande.id}` 
            : `Commande #${commande.id}`}
        </Text>
        <Text style={styles.status}>{commande.status}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>Origine: <Text style={styles.value}>{commande.origin}</Text></Text>
        <Text style={styles.label}>Destination: <Text style={styles.value}>{commande.destination}</Text></Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.dateText}>{commande.date}</Text>
        </View>
      </View>

      {shouldShowButton() && (
        <TouchableOpacity 
          style={[
            styles.button,
            commande.status === "Non traité" && styles.primaryButton,
            commande.status === "En attente d'enlèvement" && styles.secondaryButton,
            commande.status === "En cours de pickup" && styles.orangeButton,
            commande.status === "Picked" && styles.tertiaryButton,
            commande.status === "En cours de livraison" && styles.successButton
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#877DAB",
  },
  status: {
    fontSize: 14,
    color: "#666",
  },
  details: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: "bold",
  },
  value: {
    fontWeight: "normal",
    color: "#666",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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
  primaryButton: {
    backgroundColor: "#877DAB",
  },
  secondaryButton: {
    backgroundColor: "#877DAB",
  },
  orangeButton: {
    backgroundColor: "#FFA500",
  },
  tertiaryButton: {
    backgroundColor: "#5D8BF4",
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CardCommande;