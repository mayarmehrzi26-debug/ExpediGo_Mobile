import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { updateCommandeStatus } from "../services/commandeService";

interface CardProps {
  commande: any;
  onRefresh: () => void;
}

const CardCommande: React.FC<CardProps> = ({ commande, onRefresh }) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLivrer = async () => {
    await updateCommandeStatus(commande.id, commande.type);
    onRefresh();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={require("../../assets/image.png")} style={styles.icon} />
        <View style={styles.cardDetails}>
          <Text style={styles.title}>
            {commande.type === "livraison" ? "Livraison" : "Commande d’emballage"}
          </Text>
          <Text style={styles.info}>Adresse : {commande.address || "Non spécifiée"}</Text>
          <Text style={styles.info}>Client : {commande.client || "Anonyme"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </View>

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.dateText}>Date inconnue</Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity style={styles.button} onPress={handleLivrer}>
          <Text style={styles.buttonText}>Je livre</Text>
        </TouchableOpacity>
      </Animated.View>
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
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#555",
  },
  button: {
    backgroundColor: "#877DAB",
    paddingVertical: 10,
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
