import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Pour les icônes
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

const PackageDetails: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
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

          // Récupération des détails du client
          const clientDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const clientName = clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu";

          // Récupération de l'adresse de destination
          const destinationDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const destinationName = destinationDoc.exists() ? destinationDoc.data()?.address : "Client inconnu";

          // Produit nom
          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const productValue = productDoc.exists() ? productDoc.data()?.name : "produit inconnue";

          // Montant
          const montantDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const montantValue = montantDoc.exists() ? montantDoc.data()?.amount : "amount inconnue";

          // Récupération des détails de l'adresse
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
            montant: montantValue
          };
          setPackageDetails(mergedData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { backgroundColor: '#DCFCE7', color: '#22C55E' };
      case 'In Transit':
        return { backgroundColor: '#DBEAFE', color: '#3B82F6' };
      case 'Pending':
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
    <ScrollView >
      {/* Package Image Section */}
      <View style={styles.packageImageContainer}>
        <View style={styles.packageIcon}>
          <Icon name="package-variant" size={80} color="#9C27B0" />
        </View>
      </View>

      {packageDetails ? (
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.productName}>{packageDetails.product}</Text>
            <Text style={styles.deliveryId}>{packageDetails.deliveryId}</Text>
            <View style={[styles.statusBadge, getStatusColor(packageDetails.status)]}>
              <Text style={styles.statusText}>{packageDetails.status}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{' '}
              <Text style={styles.boldText}>{packageDetails.destination}</Text> pour le client{' '}
              <Text style={styles.boldText}>{packageDetails.client}</Text>.
            </Text>
            <TouchableOpacity style={styles.routeButton}>
              <Icon name="eye" size={16} color="#9C27B0" />
              <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
            </TouchableOpacity>
          </View>

          {/* Info Badges */}
          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Icon name="map-marker" size={16} color="#F7B633" />
              <Text style={styles.infoBadgeText}>{packageDetails.destination}</Text>
            </View>
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

          {/* Additional Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Client:</Text>
              <Text style={styles.detailValue}>{packageDetails.client}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Origine:</Text>
              <Text style={styles.detailValue}>{packageDetails.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Échange:</Text>
              <View style={styles.detailValueContainer}>
                {packageDetails.isExchange && (
                  <Icon name="refresh" size={16} color="#9C27B0" style={styles.icon} />
                )}
                <Text style={styles.detailValue}>
                  {packageDetails.isExchange ? 'Oui' : 'Non'}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fragile:</Text>
              <View style={styles.detailValueContainer}>
                {packageDetails.isFragile && (
                  <Icon name="alert-circle" size={16} color="#F59E0B" style={styles.icon} />
                )}
                <Text style={styles.detailValue}>
                  {packageDetails.isFragile ? 'Oui' : 'Non'}
                </Text>
              </View>
            </View>
          </View>

          {/* Price and Quantity */}
          <View style={styles.priceQuantityContainer}>
            <View>
              <Text style={styles.priceLabel}>Montant total</Text>
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
    backgroundColor: '#FFF5FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  packageImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  packageIcon: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  deliveryId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginRight: 16,
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
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#9C27B0',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 12,
    color: '#333333',
  },
  confirmButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});

export default PackageDetails;