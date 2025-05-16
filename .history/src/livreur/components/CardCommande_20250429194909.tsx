import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
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
    type: string;
    origin?: string; // Adresse du client (destination)
    client?: string;
    destination?: string; // Nouvelle propriété : adresse d'origine
    date?: string;
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

  const handleLivrer = async () => {
    await updateLivraisonStatus(commande.id);
    onRefresh();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>
            {commande.type === "livraison"
              ? `Commande ${commande.id}`
              : `Emballage ${commande.id}`}
          </Text>
          <Text style={styles.orderText}>
  Origine : <Text style={styles.originValue}>{commande.origin || "Non spécifiée"}</Text>
</Text>
<Text style={styles.orderText}>
Destination : <Text style={styles.originValue}>{commande.destination || "Non spécifiée"}</Text>
</Text>
          <Text style={styles.orderText}>Destination : <Text style={styles.originValue}></Text>{commande.destination || "Non spécifiée"}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.orderText}>{commande.date || "Date inconnue"}</Text>
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
  icon: {
    width: 90,
    height: 110,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  originValue: {
    fontWeight: 'normal',
    color: '#666',
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
  },
  orderText: {
    color: "black",
    fontSize: 15,
    marginTop: 2,
    fontWeight: "bold",

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

export default CardCommande;
