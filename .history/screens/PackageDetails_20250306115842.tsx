import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../NavigationTypes'; // Assurez-vous d'importer vos types de navigation

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;
type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route }) => {
  const { scannedData } = route.params; // Récupérer les données scannées

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Colis</Text>
      <Text style={styles.dataText}>Données scannées: {scannedData}</Text>
      {/* Ajoutez ici d'autres détails du colis */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dataText: {
    fontSize: 18,
    color: '#333',
  },
});

export default PackageDetails;