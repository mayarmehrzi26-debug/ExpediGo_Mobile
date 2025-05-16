import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import Header from "../../src/components/Header";
import StatusBadge from "../../src/components/StatusBadge";

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'PackageDetails'>;
}

interface DeliveryDetails {
  id: string;
  address: string;
  client: string;
  product: string;
  status: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  createdAt: Date;
  totalAmount: number;
  qrCodeUrl?: string;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', deliveryId));
        
        if (!deliveryDoc.exists()) {
          setError('Livraison non trouvée');
          return;
        }

        const deliveryData = deliveryDoc.data();
        
        // Fetch related data in parallel
        const [clientDoc, productDoc, addressDoc] = await Promise.all([
          getDoc(doc(firebasestore, 'clients', deliveryData.client)),
          getDoc(doc(firebasestore, 'products', deliveryData.product)),
          getDoc(doc(firebasestore, 'adresses', deliveryData.address)),
        ]);

        setDelivery({
          id: deliveryId,
          address: addressDoc.data()?.address || 'Adresse inconnue',
          client: clientDoc.data()?.name || 'Client inconnu',
          product: productDoc.data()?.name || 'Produit inconnu',
          status: deliveryData.status || 'En attente',
          payment: deliveryData.payment || 'Non spécifié',
          isExchange: deliveryData.isExchange || false,
          isFragile: deliveryData.isFragile || false,
          createdAt: deliveryData.createdAt?.toDate() || new Date(),
          totalAmount: deliveryData.totalAmount || 0,
          qrCodeUrl: deliveryData.qrCodeUrl,
        });
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des détails');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [deliveryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#574599" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Header title="Détails de livraison" showBackButton={true} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.errorContainer}>
        <Header title="Détails de livraison" showBackButton={true} />
        <Text style={styles.errorText}>Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Détails de livraison" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* QR Code Section */}
        {delivery.qrCodeUrl && (
          <View style={styles.qrCodeContainer}>
            <Image 
              source={{ uri: delivery.qrCodeUrl }} 
              style={styles.qrCodeImage} 
            />
            <Text style={styles.deliveryId}>Livraison #{delivery.id.substring(0, 8)}</Text>
          </View>
        )}

        {/* Status Section */}
        <View style={styles.statusContainer}>
          <StatusBadge status={delivery.status} />
          <Text style={styles.dateText}>
            {delivery.createdAt.toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        {/* Client and Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.clientName}>{delivery.client}</Text>
          
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color="#574599" />
            <Text style={styles.addressText}>{delivery.address}</Text>
          </View>
        </View>

        {/* Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produit</Text>
          <Text style={styles.productName}>{delivery.product}</Text>
          
          <View style={styles.tagsContainer}>
            {delivery.isFragile && (
              <View style={[styles.tag, styles.fragileTag]}>
                <Icon name="alert-octagon" size={16} color="#EF5350" />
                <Text style={styles.tagText}>Fragile</Text>
              </View>
            )}
            {delivery.isExchange && (
              <View style={[styles.tag, styles.exchangeTag]}>
                <Icon name="swap-horizontal" size={16} color="#574599" />
                <Text style={styles.tagText}>Échange</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <View style={styles.paymentContainer}>
            <Icon 
              name={delivery.payment === 'payé' ? 'check-circle' : 'cash'} 
              size={24} 
              color={delivery.payment === 'payé' ? '#66BB6A' : '#574599'} 
            />
            <Text style={styles.paymentText}>
              {delivery.payment === 'payé' ? 'Payé' : 'À percevoir'} - {delivery.totalAmount} DT
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TrackingScreen', { deliveryId: delivery.id })}
          >
            <Icon name="map-marker-path" size={20} color="#574599" />
            <Text style={styles.actionButtonText}>Suivre le colis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('EditLivraison', { deliveryId: delivery.id })}
          >
            <Icon name="pencil" size={20} color="#574599" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Modifier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  errorText: {
    textAlign: 'center',
    color: '#EF5350',
    marginTop: 20,
    fontSize: 16,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27251F',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
  },
  dateText: {
    color: '#A7A9B7',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    color: '#A7A9B7',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27251F',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#27251F',
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    color: '#27251F',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  fragileTag: {
    backgroundColor: '#FFEBEE',
  },
  exchangeTag: {
    backgroundColor: '#F3E5F5',
  },
  tagText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#27251F',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    color: '#27251F',
    marginLeft: 10,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#F0EBF8',
  },
  actionButtonText: {
    marginLeft: 10,
    color: '#574599',
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#574599',
  },
});

export default PackageDetails;