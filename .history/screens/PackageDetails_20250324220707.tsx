import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For icons
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';
import Header from "../src/components/Header";

interface PackageDetailsRouteParams {
  scannedData: string; // Tracking code of the delivery
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
  createdAt: Date;
}

interface PackageDetails {
  deliveryId: string;
  address: string;
  client: string;
  product: string;
  destination: string;
  montant: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route , navigation  }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!scannedData) {
        console.error('Aucun code de suivi fourni.');
        setLoading(false);
        return;
      }

      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', scannedData));
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data() as Delivery;

          // Retrieve client details
          const clientDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const clientName = clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu";

          // Retrieve destination address
          const destinationDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const destinationName = destinationDoc.exists() ? destinationDoc.data()?.address : "Adresse inconnue";

          // Retrieve product name
          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const productValue = productDoc.exists() ? productDoc.data()?.name : "Produit inconnu";

          // Retrieve amount


          // Retrieve address details
          const addressDoc = await getDoc(doc(firebasestore, 'adresses', deliveryData.address));
          const addressValue = addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue";

          const mergedData: PackageDetails = {
            deliveryId: deliveryData.id,
            address: addressValue,
            client: clientName,
            product: productValue,
            destination: destinationName,
            payment: deliveryData.payment,
            isExchange: deliveryData.isExchange,
            isFragile: deliveryData.isFragile,
            status: deliveryData.status,
            createdAt: deliveryData.createdAt.toDate(),
            montant: deliveryData.totalAmount,
          };
          setPackageDetails(mergedData);
        } else {
          console.error(`Aucune livraison trouvée avec le code de suivi: ${scannedData}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la livraison :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente':
        return { backgroundColor: '#F06292', color: '#22C55E' };
      case 'En cours de livraison':
        return { backgroundColor: '#DBEAFE', color: '#3B82F6' };
      case 'Livré':
        return { backgroundColor: '#FEF9C3', color: '#F59E0B' };
        case 'Livré':
        return { backgroundColor: '#FEF9C3', color: '#F59E0B' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
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
      <Header title="Détails de colis" showBackButton={true} />
      <View style={styles.packageImageContainer}>
        <Image 
          source={require("../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
      </View>

      <ScrollView>
        {packageDetails ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>Commande #{packageDetails.deliveryId}</Text>
             
            </View>
            <View style={[styles.statusBadge, getStatusColor(packageDetails.status)]}>
                <Text style={styles.statusText}>{packageDetails.status}</Text>
              </View>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{' '}
                <Text style={styles.boldText}>{packageDetails.destination}</Text> pour le client{' '}
                <Text style={styles.boldText}>{packageDetails.client}</Text>.
              </Text>
              <TouchableOpacity 
  style={styles.routeButton} 
  onPress={() => navigation.navigate('TrackingScreen')}
>
  <Icon name="eye" size={16} color="#9C27B0" />
  <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
</TouchableOpacity>
            </View>

            <View style={styles.infoBadgesContainer}>
              <View style={styles.infoBadge}>
                <Icon name="credit-card" size={16} color="#F06292" />
                <Text style={styles.infoBadgeText}>{packageDetails.payment}</Text>
              </View>
              <View style={styles.infoBadge}>
                <Icon name="calendar" size={16} color="#9C27B0" />
                <Text style={styles.infoBadgeText}>
                  {new Date(packageDetails.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="package-variant" size={16} color="#9C27B0" />
                  <Text style={styles.detailLabel}> Produit:</Text>
                </View>
                <Text style={styles.detailValue}>{packageDetails.product}</Text>
              </View>
            </View>

            <View style={styles.priceQuantityContainer}>
              <View>
                <Text style={styles.priceLabel}>Montant total :</Text>
                <Text style={styles.priceValue}>{packageDetails.montant} dt</Text>
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#877DAB',
  },
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: -40, // Move image up
  },
  card: {
    backgroundColor: '#F1DBF2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom:12
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  routeButtonText: {
    fontSize: 14,
    color: '#9C27B0',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  detailsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  noDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
  },
  noDetailsText: {
    fontSize: 16,
    color: '#666666',
  },
  packageImage: {
    width: 390,
    height: 300,
  },
});

export default PackageDetails;