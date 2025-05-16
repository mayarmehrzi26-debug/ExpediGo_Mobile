import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { updateOrderStatus } from "../services/commandeService";

interface Commande {
  id: string;
  type: "emballage" | "livraison";
  origin: string;
  destination: string;
  date: string;
  status: string;
  size?: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
}

interface CardProps {
  commande: Commande;
  onRefresh: () => void;
}

const CardCommande: React.FC<CardProps> = ({ commande, onRefresh }) => {
  const handleLivrer = async () => {
    const success = await updateOrderStatus(commande.id, "en cours", commande.type);
    if (success) {
      onRefresh();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>
            {commande.type === "livraison" 
              ? `Livraison ${commande.id}` 
              : `Emballage ${commande.id}`}
          </Text>
          
          {commande.type === "emballage" && (
            <>
              <Text style={styles.orderText}>Taille: {commande.size}</Text>
              <Text style={styles.orderText}>Quantité: {commande.quantity}</Text>
              <Text style={styles.orderText}>Prix: {commande.price} €</Text>
              <Text style={styles.orderText}>Total: {commande.totalPrice} €</Text>
            </>
          )}
          
          <Text style={styles.orderText}>Origine: {commande.origin}</Text>
          <Text style={styles.orderText}>Destination: {commande.destination}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.orderText}>{commande.date}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLivrer}
        disabled={commande.status !== "non traité"}
      >
        <Text style={styles.buttonText}>
          {commande.status === "non traité" ? "Je livre" : "En cours"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (garder les mêmes styles que vous avez)
});

export default CardCommande;