import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Livraison } from '../models/LivraisonModel';
import { selectLivraisons } from '../redux/selectors';

const NouvelleLivraisonScreen = () => {
  const livraisons = useSelector(selectLivraisons);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle Livraison</Text>
      {livraisons.map((livraison: Livraison) => (
        <View key={livraison.id} style={styles.card}>
          <Text>Client : {livraison.client}</Text>
          <Text>Produit : {livraison.product}</Text>
          <Text>Adresse : {livraison.address}</Text>
          <Text>Status : {livraison.status}</Text>
          <Text>Montant Total : {livraison.totalAmount} TND</Text>
          <Text>Créée le : {livraison.createdAt.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
};

export default NouvelleLivraisonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
});
