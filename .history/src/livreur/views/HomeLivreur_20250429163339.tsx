import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import CardCommande from '../../CardCommande';
import CardEmballage from './CardEmballage'; // Importation du composant CardEmballage

const HomeLivreur: React.FC = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'livraison' | 'emballage'>('livraison');

  // Fonction de récupération des commandes (simulée ici)
  const loadCommandes = () => {
    // Exemple de données simulées
    const commandesData = [
      { id: '1', type: 'livraison', origin: 'Paris', destination: 'Lyon' },
      { id: '2', type: 'emballage', origin: 'Marseille', destination: 'Paris' },
      { id: '3', type: 'livraison', origin: 'Lyon', destination: 'Nice' },
      { id: '4', type: 'emballage', origin: 'Bordeaux', destination: 'Toulouse' },
    ];
    setCommandes(commandesData);
  };

  // Appel de la fonction pour charger les commandes au démarrage
  useEffect(() => {
    loadCommandes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'livraison' && styles.selectedButton]}
          onPress={() => setSelectedType('livraison')}
        >
          <Text style={styles.filterText}>Commandes de livraison</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'emballage' && styles.selectedButton]}
          onPress={() => setSelectedType('emballage')}
        >
          <Text style={styles.filterText}>Commandes d’emballage</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={commandes.filter((cmd) => cmd.type === selectedType)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (selectedType === 'emballage') {
            return <CardEmballage commande={item} onRefresh={loadCommandes} />;
          } else {
            return <CardCommande commande={item} onRefresh={loadCommandes} />;
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  selectedButton: {
    backgroundColor: '#877DAB',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeLivreur;
