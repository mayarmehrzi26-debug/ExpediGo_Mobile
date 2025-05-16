import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;
type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

interface Package {
  id: string;
  deliveryId: string;
  qrCodeUrl: string;
}

interface Delivery {
  id: string;
  address: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);

        // Récupérer les détails du colis
        const packageRef = doc(firebasestore, 'packages', scannedData);
        const packageSnap = await getDoc(packageRef);

        if (packageSnap.exists()) {
          const packageData = packageSnap.data() as Package;
          setPackageDetails(packageData);

          // Récupérer les détails de la livraison
          const deliveryRef = doc(firebasestore, 'livraison', packageData.deliveryId);
          const deliverySnap = await getDoc(deliveryRef);

          if (deliverySnap.exists()) {
            setDeliveryDetails(deliverySnap.data() as Delivery);
          } else {
            console.error('Aucune livraison trouvée pour ce colis.');
          }
        } else {
          console.error('Aucun colis trouvé avec cet ID.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du colis :', error);
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
      {packageDetails && deliveryDetails ? (
        <>
          <Text style={styles.dataText}>ID du colis: {packageDetails.id}</Text>
          <Text style={styles.dataText}>Client: {deliveryDetails.client}</Text>
          <Text style={styles.dataText}>Adresse: {deliveryDetails.address}</Text>
          <Text style={styles.dataText}>Produit: {deliveryDetails.product}</Text>
          <Text style={styles.dataText}>Statut: {deliveryDetails.status}</Text>
          <Text style={styles.dataText}>Paiement: {deliveryDetails.payment}</Text>
          <Text style={styles.dataText}>Échange: {deliveryDetails.isExchange ? 'Oui' : 'Non'}</Text>
          <Text style={styles.dataText}>Fragile: {deliveryDetails.isFragile ? 'Oui' : 'Non'}</Text>
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
    marginBottom: 8,
  },
});

export default PackageDetails;
