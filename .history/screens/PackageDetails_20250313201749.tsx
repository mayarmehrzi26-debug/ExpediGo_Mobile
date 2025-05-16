import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';
import Header from "../src/components/Header";

interface PackageDetailsRouteParams {
  scannedData: string; // ID de la livraison scanné
}

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'> & {
  params: PackageDetailsRouteParams;
};

type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

interface Delivery {
  id: string;
  address: string;
  destination: string;
  montant: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: any;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!scannedData) {
        console.error('Aucun ID scanné fourni.');
        setLoading(false);
        return;
      }

      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', scannedData));
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data() as Delivery;

          // Récupération des informations associées
          const clientDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const clientName = clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu";

          const destinationDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.destination));
          const destinationName = destinationDoc.exists() ? destinationDoc.data()?.address : "Destination inconnue";

          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const productValue = productDoc.exists() ? productDoc.data()?.name : "Produit inconnu";
          const montantValue = productDoc.exists() ? productDoc.data()?.amount : "Montant inconnu";

          const addressDoc = await getDoc(doc(firebasestore, 'adresses', deliveryData.address));
          const addressValue = addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue";

          setPackageDetails({
            ...deliveryData,
            address: addressValue,
            client: clientName,
            product: productValue,
            destination: destinationName,
            montant: montantValue,
            createdAt: deliveryData.createdAt.toDate(),
          });
        } else {
          console.error(`Aucune livraison trouvée avec l'ID: ${scannedData}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la livraison :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <ScrollView style={styles.container}>
        <View style={styles.packageImageContainer}>
          <View style={styles.packageIcon}>
            <Icon name="package-variant" size={80} color="#9C27B0" />
          </View>
        </View>

        {packageDetails ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{packageDetails.product}</Text>
              <Text style={styles.deliveryId}>{packageDetails.id}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.descriptionText}>
                Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{' '}
                <Text style={styles.boldText}>{packageDetails.destination}</Text> pour{' '}
                <Text style={styles.boldText}>{packageDetails.client}</Text>.
              </Text>
            </View>

            <View style={styles.priceQuantityContainer}>
              <View>
                <Text style={styles.priceLabel}>Montant total</Text>
                <Text style={styles.priceValue}>{packageDetails.montant} dt</Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirmer la Livraison</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noDetailsContainer}>
            <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette livraison.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FFF5FB', paddingHorizontal: 16, paddingTop: 16 },
  packageImageContainer: { alignItems: 'center', marginBottom: 24 },
  packageIcon: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 100, elevation: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, elevation: 4 },
  cardHeader: { marginBottom: 16 },
  productName: { fontSize: 24, fontWeight: 'bold' },
  deliveryId: { fontSize: 14, color: '#666666', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#666666' },
  boldText: { fontWeight: 'bold' },
  priceQuantityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  priceLabel: { fontSize: 14, color: '#666666' },
  priceValue: { fontSize: 24, fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { padding: 8 },
  quantityButtonText: { fontSize: 18, color: '#9C27B0' },
  confirmButton: { backgroundColor: '#9C27B0', borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});

export default PackageDetails;
