import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';

interface PackageDetailsRouteParams {
  scannedData: string; // ID du colis scanné
}

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'> & {
  params: PackageDetailsRouteParams;
};

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

interface PackageDetails {
  packageId: string;
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
  const { scannedData } = route.params; 
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const packageDoc = await getDoc(doc(firebasestore, 'packages', scannedData));
        if (packageDoc.exists()) {
          const packageData = packageDoc.data() as Package;
          const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', packageData.id));

          if (deliveryDoc.exists()) {
            const deliveryData = deliveryDoc.data() as Delivery;

            // Récupération des détails du client
            const clientDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
            const clientName = clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu";

            // Récupération des détails de l'adresse
            const addressDoc = await getDoc(doc(firebasestore, 'adresses', deliveryData.address));
            const addressValue = addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue";

            const mergedData: PackageDetails = {
              packageId: packageData.id,
              deliveryId: packageData.deliveryId,
              address: addressValue,
              client: clientName,
              product: deliveryData.product,
              payment: deliveryData.payment,
              isExchange: deliveryData.isExchange,
              isFragile: deliveryData.isFragile,
              status: deliveryData.status,
              createdAt: deliveryData.createdAt.toDate(),
            };
            setPackageDetails(mergedData);
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
      {packageDetails ? (
        <>
          <Text style={styles.dataText}>ID du colis: {packageDetails.packageId}</Text>
          <Text style={styles.dataText}>ID de la livraison: {packageDetails.deliveryId}</Text>
          <Text style={styles.dataText}>Client: {packageDetails.client}</Text>
          <Text style={styles.dataText}>Adresse: {packageDetails.address}</Text>
          <Text style={styles.dataText}>Produit: {packageDetails.product}</Text>
          <Text style={styles.dataText}>Statut: {packageDetails.status}</Text>
          <Text style={styles.dataText}>Paiement: {packageDetails.payment}</Text>
          <Text style={styles.dataText}>Échange: {packageDetails.isExchange ? 'Oui' : 'Non'}</Text>
          <Text style={styles.dataText}>Fragile: {packageDetails.isFragile ? 'Oui' : 'Non'}</Text>
          <Text style={styles.dataText}>Date de création: {packageDetails.createdAt.toLocaleString()}</Text>
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