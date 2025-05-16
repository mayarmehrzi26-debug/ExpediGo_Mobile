import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';
import StatusBadge from '../src/components/StatusBadge';

// Définir le type des paramètres de route
interface PackageDetailsRouteParams {
  scannedData: string; // scannedData est une chaîne de caractères (l'ID du colis)
}

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'> & {
  params: PackageDetailsRouteParams; // Spécifiez le type de route.params
};

type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

interface Package {
  id: string;
  deliveryId: string; // ID de la livraison associée
  qrCodeUrl: string; // URL du code QR
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

interface PackageDetails {
  Packageid: string;
  deliveryId: string;
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
  const { scannedData } = route.params; // ID du colis scanné
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        console.log("Scanned Data (Package ID):", scannedData);

        // Récupérer les détails du colis depuis Firestore
        const packageDoc = await getDoc(doc(firebasestore, 'packages', scannedData));
        if (!packageDoc.exists()) {
          console.error('Aucun colis trouvé avec cet ID:', scannedData);
          alert('Aucun colis trouvé avec cet ID.');
          setLoading(false);
          return;
        }

        const packageData = packageDoc.data() as Package;
        console.log("Package Data:", packageData);

        // Récupérer les détails de la livraison associée
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', packageData.deliveryId));
        if (!deliveryDoc.exists()) {
          console.error('Aucune livraison trouvée pour ce colis:', packageData.deliveryId);
          alert('Aucune livraison trouvée pour ce colis.');
          setLoading(false);
          return;
        }

        const deliveryData = deliveryDoc.data() as Delivery;
        console.log("Delivery Data:", deliveryData);

        // Fusionner les données du colis et de la livraison
        const mergedData: PackageDetails = {
          Packageid: packageData.id,
          deliveryId: packageData.deliveryId,
          address: deliveryData.address,
          client: deliveryData.client,
          product: deliveryData.product,
          payment: deliveryData.payment,
          isExchange: deliveryData.isExchange,
          isFragile: deliveryData.isFragile,
          status: deliveryData.status,
          createdAt: deliveryData.createdAt.toDate(), // Convertir Firestore Timestamp en Date
        };

        setPackageDetails(mergedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du colis :', error);
        alert('Une erreur s\'est produite lors de la récupération des détails du colis.');
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

  if (!packageDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aucun détail trouvé pour ce colis.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Colis</Text>
      <Text style={styles.dataText}>ID du colis: {packageDetails.Packageid}</Text>
      <Text style={styles.dataText}>ID de la livraison: {packageDetails.deliveryId}</Text>
      <Text style={styles.dataText}>Client: {packageDetails.client}</Text>
      <Text style={styles.dataText}>Adresse: {packageDetails.address}</Text>
      <Text style={styles.dataText}>Produit: {packageDetails.product}</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.deliverySubtitle}>Statut</Text>
        <StatusBadge status={packageDetails.status} /> {/* Utilisation de StatusBadge */}
      </View>
      <Text style={styles.dataText}>Paiement: {packageDetails.payment}</Text>
      <Text style={styles.dataText}>Échange: {packageDetails.isExchange ? 'Oui' : 'Non'}</Text>
      <Text style={styles.dataText}>Fragile: {packageDetails.isFragile ? 'Oui' : 'Non'}</Text>
      <Text style={styles.dataText}>Date de création: {packageDetails.createdAt.toLocaleString()}</Text>
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: '#A7A9B7',
    marginTop: 5,
  },
});

export default PackageDetails;