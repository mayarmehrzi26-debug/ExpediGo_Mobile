import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { updateOrderStatus } from "../services/commandeService"; // Assurez-vous d'importer le service correctement

interface CardProps {
  emballage: {
    id: string;
    size: string; // Taille de l'emballage
    origin?: string; // Adresse du client (origine)
    destination?: string; // Destination de la commande
    date?: string;
  };
  onRefresh: () => void; // Fonction pour rafraîchir la liste des commandes
}

const CardEmballage: React.FC<CardProps> = ({ emballage, onRefresh }) => {
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

  const handleLivrer = async () => {
    await updateOrderStatus(emballage.id, "en cours"); // Mettez à jour le statut de la commande
    onRefresh(); // Rafraîchissez les données après l'action
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>
            Emballage {emballage.id}
          </Text>
          <Text style={styles.orderText}>Origine : {emballage.origin || "Non spécifiée"}</Text>
          <Text style={styles.orderText}>Destination : {emballage.destination || "Non spécifiée"}</Text>
          <Text style={styles.orderText}>Taille : {emballage.size}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.orderText}>{emballage.date || "Date inconnue"}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLivrer}>
        <Text style={styles.buttonText}>Je livre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1EEFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#877DAB",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CardEmballage;
