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
        
        // Fetch related data
        const [clientDoc, productDoc, addressDoc, assignedToDoc] = await Promise.all([
          getDoc(doc(firebasestore, 'clients', deliveryData.client)),
          getDoc(doc(firebasestore, 'products', deliveryData.product)),
          getDoc(doc(firebasestore, 'adresses', deliveryData.address)),
          getDoc(doc(firebasestore, 'users', deliveryData.assignedTo)),
        ]);

        setDelivery({
          id: deliveryId,
          address: addressDoc.data()?.address || 'Adresse inconnue',
          client: clientDoc.data()?.name || 'Client inconnu',
          clientAdress: clientDoc.data()?.address || 'Client inconnu',
          livreur: assignedToDoc.data()?.name,
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
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Header title="Détails de colis" showBackButton={true} />
        <View style={styles.noDetailsContainer}>
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
      />
      
      <View style={styles.topSection}>
        <Image 
          source={require("../../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Commande #{delivery.id.substring(0, 8)}</Text>
          <StatusBadge status={delivery.status} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              <View>
                <Text style={styles.contactName}>{delivery.client}</Text>
                <Text style={styles.contactRole}>Destinataire</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="message-text" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="phone" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {delivery.status !== "Non traité" && delivery.status !== "Annulée" && (
              <View style={styles.contactCard}>
                <View>
                  <Text style={styles.contactName}>{delivery.livreur}</Text>
                  <Text style={styles.contactRole}>Livreur</Text>
                </View>
                <View style={styles.contactButtons}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="message-text" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="phone" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Delivery Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations de livraison</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="map-marker" size={20} color="#7E57C2" />
                <Text style={styles.infoText}>
                  De <Text style={styles.highlight}>{delivery.address}</Text> vers <Text style={styles.highlight}>{delivery.clientAdress}</Text>
                </Text>
              </View>
              
              {delivery.status === "En cours de livraison" && (
                <TouchableOpacity 
                  style={styles.routeButton} 
                  onPress={() => navigation.navigate('TrackingScreen', { 
                    deliveryId: delivery.id,
                    fromAddress: delivery.address,
                    toAddress: delivery.destination
                  })}
                >
                  <Icon name="map-marker-path" size={16} color="#7E57C2" />
                  <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Package Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails du colis</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Icon name="package-variant" size={18} color="#7E57C2" />
                  <Text style={styles.detailText}>Produit</Text>
                </View>
                <Text style={styles.detailValue}>{delivery.product}</Text>
              </View>
              
              {delivery.isFragile && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Icon name="alert-octagon" size={18} color="#EF5350" />
                    <Text style={styles.detailText}>Type</Text>
                  </View>
                  <Text style={[styles.detailValue, styles.fragileText]}>Colis fragile</Text>
                </View>
              )}
              
              {delivery.isExchange && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Icon name="swap-horizontal" size={18} color="#7E57C2" />
                    <Text style={styles.detailText}>Type</Text>
                  </View>
                  <Text style={styles.detailValue}>Échange</Text>
                </View>
              )}
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paiement</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Icon name="credit-card" size={20} color="#7E57C2" />
                <Text style={styles.paymentText}>Méthode: <Text style={styles.paymentValue}>{delivery.payment}</Text></Text>
              </View>
              <View style={styles.paymentRow}>
                <Icon name="calendar" size={20} color="#7E57C2" />
                <Text style={styles.paymentText}>Date: <Text style={styles.paymentValue}>
                  {delivery.createdAt.toLocaleDateString('fr-FR')}
                </Text></Text>
              </View>
            </View>
          </View>

          {/* Total Amount */}
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalLabel}>Montant total</Text>
            <Text style={styles.totalAmount}>{delivery.totalAmount ?? 0} dt</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    backgroundColor: '#7E57C2',
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  packageImage: {
    width: 200,
    height: 150,
    marginTop: 10,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#7E57C2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#212121',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  routeButtonText: {
    fontSize: 14,
    color: '#7E57C2',
    marginLeft: 8,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  fragileText: {
    color: '#EF5350',
  },
  paymentCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 10,
  },
  paymentValue: {
    fontWeight: '500',
    color: '#212121',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 16,
    color: '#616161',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E57C2',
  },
  noDetailsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noDetailsText: {
    fontSize: 16,
    color: '#616161',
  },
});

export default PackageDetails;