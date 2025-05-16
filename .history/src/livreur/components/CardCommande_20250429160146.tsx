import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface Commande {
  id: string;
  origine: string;       // adresse de pickup (expéditeur)
  destination: string;   // adresse du client
  produit: string;
  statut: string;
  date: string;
}

interface Props {
  commande: Commande;
}

const CardCommande: React.FC<Props> = ({ commande }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Commande #{commande.id}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Produit :</Text>
          <Text style={styles.value}>{commande.produit}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Origine :</Text>
          <Text style={styles.value}>{commande.origine}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destination :</Text>
          <Text style={styles.value}>{commande.destination}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Statut :</Text>
          <Text style={styles.value}>{commande.statut}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date :</Text>
          <Text style={styles.value}>{commande.date}</Text>
        </View>
      </Card.Content>
    </Card>
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
