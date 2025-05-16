import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig'; // Assurez-vous que le chemin est correct
import { RootStackParamList } from '../NavigationTypes'; // Assurez-vous que le chemin est correct

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
        // Récupérer les détails du colis depuis Firestore
        const packageDoc = await getDoc(doc(firebasestore, 'packages', scannedData));
        if (packageDoc.exists()) {
          const packageData = packageDoc.data() as Package;

          // Récupérer les détails de la livraison associée
          const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', packageData.deliveryId));
          if (deliveryDoc.exists()) {
            const deliveryData = deliveryDoc.data() as Delivery;

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
          <Text style={styles.dataText}>ID du colis: {packageDetails.Packageid}</Text>
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