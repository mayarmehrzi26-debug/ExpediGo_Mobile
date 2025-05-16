import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../NavigationTypes';

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;
type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

interface Package {
  id: string;
  name: string;
  status: string;
  // Ajoutez d'autres champs selon vos besoins
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await fetch(`https://yourapi.com/packages/${scannedData}`);
        const data = await response.json();
        setPackageDetails(data);
      } catch (error) {
        console.error('Error fetching package details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Colis</Text>
      {packageDetails ? (
        <>
          <Text style={styles.dataText}>Nom: {packageDetails.name}</Text>
          <Text style={styles.dataText}>Statut: {packageDetails.status}</Text>
          {/* Affichez d'autres détails du colis ici */}
        </>
      ) : (
        <Text style={styles.dataText}>Aucun détail trouvé pour ce colis.</Text>
      )}
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