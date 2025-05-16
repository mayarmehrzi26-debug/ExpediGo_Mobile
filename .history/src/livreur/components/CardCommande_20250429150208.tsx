import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { updateCommandeStatus } from "../services/commandeService";

interface CardProps {
  commande: any;
  onRefresh: () => void;
}

const CardCommande: React.FC<CardProps> = ({ commande, onRefresh }) => {
  const handleLivrer = async () => {
    await updateCommandeStatus(commande.id, commande.type);
    onRefresh();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{commande.type === "livraison" ? "Livraison" : "Commande d’emballage"}</Text>
      <Text>Adresse : {commande.address || "Non spécifiée"}</Text>
      <Text>Client : {commande.client || "Anonyme"}</Text>

      <TouchableOpacity onPress={handleLivrer} style={styles.button}>
        <Text style={styles.btnText}>Je livre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#877DAB",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CardCommande;
