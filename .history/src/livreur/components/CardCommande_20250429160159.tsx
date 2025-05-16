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
    margin: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    fontWeight: '600',
    width: 100,
  },
  value: {
    flexShrink: 1,
  },

});

export default CardCommande;
