import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { EmballageOrder } from "../../../FirebaseConfig"; // Assurez-vous que l'import correspond à votre fichier
import { updateOrderStatus } from "../../../services/orderService"; // Fonction à créer pour mettre à jour l'état de la commande

interface CardEmballageProps {
  order: EmballageOrder;
}

const CardEmballage: React.FC<CardEmballageProps> = ({ order }) => {
  const handleDelivery = async () => {
    try {
      // Mettre à jour le statut de la commande en "En cours"
      await updateOrderStatus(order.id, "en cours");
      console.log(`Commande ${order.id} en cours de livraison`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande", error);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.id}>ID de commande: {order.id}</Text>
      <Text style={styles.destination}>Adresse: {order.size}</Text> {/* Vous pouvez remplacer "size" par l'adresse réelle */}
      <Button title="Je livre" onPress={handleDelivery} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#f4f4f4",
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  id: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  destination: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default CardEmballage;
