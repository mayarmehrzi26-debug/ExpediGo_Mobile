import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { updateLivraisonStatus } from "../services/commandeService";
import { updateEmballageStatus } from "../services/EmballageService";

interface CardProps {
  commande: {
    id: string;
    type: 'livraison' | 'emballage';
    // Champs communs
    status?: string;
    date?: string;
    destination?: string;
    // Champs spécifiques aux livraisons
    origin?: string;
    client?: string;
    // Champs spécifiques aux emballages
    size?: string;
    quantity?: number;
    price?: number;
    totalPrice?: number;
    clientEmail?: string;
  };
  onRefresh: () => void;
}

const CardCommande: React.FC<CardProps> = ({ commande, onRefresh }) => {
  const handleAction = async () => {
    try {
      if (commande.type === 'livraison') {
        await updateLivraisonStatus(commande.id, "En cours");
      } else {
        await updateEmballageStatus(commande.id, "en cours");
      }
      onRefresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const isDisabled = commande.status !== "non traité" && commande.status !== "Non traité";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {commande.type === 'livraison' 
          ? `Livraison #${commande.id}` 
          : `Emballage #${commande.id}`}
      </Text>

      {commande.type === 'livraison' ? (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{commande.client || "Non spécifié"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Destination:</Text>
            <Text style={styles.value}>{commande.destination || "Non spécifiée"}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Taille:</Text>
            <Text style={styles.value}>{commande.size}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Quantité:</Text>
            <Text style={styles.value}>{commande.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Prix total:</Text>
            <Text style={styles.value}>{commande.totalPrice} €</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{commande.clientEmail || "Non spécifié"}</Text>
          </View>
        </>
      )}

      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.dateText}>{commande.date || "Date inconnue"}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={handleAction}
        disabled={isDisabled}
      >
        <Text style={styles.buttonText}>
          {isDisabled 
            ? "En cours" 
            : commande.type === 'livraison' ? "Je livre" : "Prendre en charge"}
        </Text>
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

export default CardCommande;
