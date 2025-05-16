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

const PackageDetails: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', deliveryId));
        
        if (!deliveryDoc.exists()) {
          console.error('Livraison non trouvée');
          return;
        }

        const deliveryData = deliveryDoc.data();
        
        const [clientDoc, productDoc, addressDoc] = await Promise.all([
          getDoc(doc(firebasestore, 'clients', deliveryData.client)),
          getDoc(doc(firebasestore, 'products', deliveryData.product)),
          getDoc(doc(firebasestore, 'adresses', deliveryData.address)),
        ]);

        setDelivery({
          id: deliveryId,
          address: addressDoc.data()?.address || 'Adresse inconnue',
          client: clientDoc.data()?.name || 'Client inconnu',
          clientAdress: clientDoc.data()?.address || 'Client inconnu',
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
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [deliveryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Header title="Détails de colis" showBackButton={true} />
        <View style={styles.noDetailsContainer}>
          <Icon name="package-variant-closed" size={40} color="#9CA3AF" />
          <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette livraison</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Détails de colis" 
        showBackButton={true}
        headerStyle={styles.headerStyle}
      />
      
      <View style={styles.packageImageContainer}>
        <Image 
          source={require("../../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Section Destinataire */}
          <View style={styles.contactSection}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>Destinataire</Text>
                <Text style={styles.clientName}>{delivery.client}</Text>
                <Text style={styles.addressText}>{delivery.clientAdress}</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Icon name="message-text" size={20} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Icon name="phone" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section Livreur (si applicable) */}
          {delivery.status !== "Non traité" && delivery.status !== "Annulée" && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Livreur</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.driverName}>Mohamed Ali</Text>
                <View style={styles.contactButtons}>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="message-text" size={20} color="#6C63FF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="phone" size={20} color="#6C63FF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Section Commande */}
          <View style={styles.orderSection}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Commande #{delivery.id.substring(0, 8)}</Text>
              <StatusBadge status={delivery.status} />
            </View>

            <Text style={styles.orderDescription}>
              Colis de <Text style={styles.highlightText}>{delivery.address}</Text> vers {' '}
              <Text style={styles.highlightText}>{delivery.clientAdress}</Text>
            </Text>

            {delivery.status === "En cours de livraison" && (
              <TouchableOpacity 
                style={styles.routeButton} 
                onPress={() => navigation.navigate('TrackingScreen', { 
                  deliveryId: delivery.id,
                  fromAddress: delivery.address,
                  toAddress: delivery.destination
                })}
              >
                <Icon name="map-marker-path" size={18} color="#6C63FF" />
                <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section Infos */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="credit-card" size={18} color="#6C63FF" />
                <Text style={styles.infoText}>{delivery.payment}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="calendar" size={18} color="#6C63FF" />
                <Text style={styles.infoText}>
                  {delivery.createdAt.toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailItem}>
              <Icon name="package-variant" size={18} color="#6C63FF" />
              <Text style={styles.detailLabel}>Produit:</Text>
              <Text style={styles.detailValue}>{delivery.product}</Text>
            </View>
            
            {delivery.isFragile && (
              <View style={styles.detailItem}>
                <Icon name="alert-octagon" size={18} color="#FF6B6B" />
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>Colis fragile</Text>
              </View>
            )}
            
            {delivery.isExchange && (
              <View style={styles.detailItem}>
                <Icon name="swap-horizontal" size={18} color="#6C63FF" />
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>Échange</Text>
              </View>
            )}
          </View>

          {/* Section Prix */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Montant total</Text>
            <Text style={styles.priceValue}>{delivery.totalAmount ?? 0} DT</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerStyle: {
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  packageImage: {
    width: 350,
    height: 250,
    borderRadius: 15,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactSection: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  addressText: {
    fontSize: 14,
    color: '#718096',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    backgroundColor: '#E6E8FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSection: {
    marginVertical: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  orderDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  highlightText: {
    fontWeight: '600',
    color: '#2D3748',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routeButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    marginLeft: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  noDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDetailsText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PackageDetails;