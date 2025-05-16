import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import { updateCommandeStatus } from "../services/commandeService"; // ✅ Ton service modifié

interface Commande {
  id: string;
  origin: string;
  destination: string;
  date: string;
  status: string;
  type: "emballage" | "livraison";
}

interface CardProps {
  commande: Commande;
  onRefresh: () => void;
}

const CardEmballage: React.FC<CardProps> = ({ commande, onRefresh }) => {
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
    await updateCommandeStatus(commande.id, "en cours");
    onRefresh();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>{commande.type.toUpperCase()} {commande.id}</Text>
          <Text style={styles.orderText}>Origine : {commande.origin}</Text>
          <Text style={styles.orderText}>Destination : {commande.destination}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.orderText}>{commande.date}</Text>
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
