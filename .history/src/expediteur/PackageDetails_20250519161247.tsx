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
          setLoading(false);
          return;
        }

        const deliveryData = deliveryDoc.data();
        
        // Fetch related data with error handling
        const fetchData = async () => {
          try {
            const [clientDoc, productDoc, addressDoc, assignedToDoc] = await Promise.all([
              deliveryData.client ? getDoc(doc(firebasestore, 'clients', deliveryData.client)) : Promise.resolve(null),
              deliveryData.product ? getDoc(doc(firebasestore, 'products', deliveryData.product)) : Promise.resolve(null),
              deliveryData.address ? getDoc(doc(firebasestore, 'adresses', deliveryData.address)) : Promise.resolve(null),
              deliveryData.assignedTo ? getDoc(doc(firebasestore, 'users', deliveryData.assignedTo)) : Promise.resolve(null),
            ]);

            return {
              client: clientDoc?.exists() ? clientDoc.data()?.name : 'Client inconnu',
              destination: clientDoc?.exists() ? clientDoc.data()?.address : 'Adresse inconnue',
              product: productDoc?.exists() ? productDoc.data()?.name : 'Produit inconnu',
              address: addressDoc?.exists() ? addressDoc.data()?.address : 'Adresse inconnue',
              livreur: assignedToDoc?.exists() ? assignedToDoc.data()?.name : 'Non assigné',
            };
          } catch (error) {
            console.error('Error fetching related data:', error);
            return {
              client: 'Client inconnu',
              destination: 'Adresse inconnue',
              product: 'Produit inconnu',
              address: 'Adresse inconnue',
              livreur: 'Non assigné',
            };
          }
        };

        const relatedData = await fetchData();

        setDelivery({
          id: deliveryId,
          ...deliveryData,
          ...relatedData,
          status: deliveryData.status || 'En attente',
          payment: deliveryData.payment || 'Non spécifié',
          isExchange: deliveryData.isExchange || false,
          isFragile: deliveryData.isFragile || false,
          createdAt: deliveryData.createdAt?.toDate() || new Date(),
          totalAmount: deliveryData.totalAmount || 0,
          qrCodeUrl: deliveryData.qrCodeUrl || LivraisonModel.generateQRCode(deliveryId),
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
        <ActivityIndicator size="large" color="#877DAB" />
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
      <View style={styles.packageImageContainer}>
        <Image 
          source={require("../../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
      </View>

      <ScrollView>
        <View style={styles.card}>
          <View style={styles.contactSection}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>{delivery.client}</Text>
                <Text style={styles.descriptionText}>Destinataire</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Icon name="message-text" size={20} color="#877DAB" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Icon name="phone" size={20} color="#877DAB" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {delivery.status !== "Non traité" && delivery.status !== "Annulée" && delivery.livreur && (
            <View style={styles.contactSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.sectionTitle}>Livreur</Text>
                  <Text style={styles.sectionTitle}>{delivery.livreur}</Text>
                </View>
                <View style={styles.contactButtons}>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="message-text" size={20} color="#877DAB" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <Icon name="phone" size={20} color="#877DAB" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.productName}>Commande #{delivery.id.substring(0, 8)}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <StatusBadge status={delivery.status} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Colis de <Text style={styles.boldText}>{delivery.address}</Text> vers{' '}
              <Text style={styles.boldText}>{delivery.destination}</Text> pour le client{' '}
              <Text style={styles.boldText}>{delivery.client}</Text>
            </Text>
            
            {delivery.status === "En cours de livraison" && (
              <TouchableOpacity 
                style={styles.routeButton} 
                onPress={() => navigation.navigate('TrackingScreen', { 
                  deliveryId: delivery.id,
                  fromAddress: delivery.address,
                  toAddress: delivery.destination,
                  livreurId: delivery.assignedTo,
                })}
              >
                <Icon name="map-marker-path" size={16} color="#877DAB" />
                <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Icon name="credit-card" size={16} color="#F06292" />
              <Text style={styles.infoBadgeText}>{delivery.payment}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Icon name="calendar" size={16} color="#877DAB" />
              <Text style={styles.infoBadgeText}>
                {delivery.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Icon name="package-variant" size={16} color="#877DAB" />
                <Text style={styles.detailLabel}> Produit:</Text>
              </View>
              <Text style={styles.detailValue}>{delivery.product}</Text>
            </View>
            
            {delivery.isFragile && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="alert-octagon" size={16} color="#EF5350" />
                  <Text style={styles.detailLabel}> Type:</Text>
                </View>
                <Text style={styles.detailValue}>Colis fragile</Text>
              </View>
            )}
            
            {delivery.isExchange && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="swap-horizontal" size={16} color="#877DAB" />
                  <Text style={styles.detailLabel}> Type:</Text>
                </View>
                <Text style={styles.detailValue}>Échange</Text>
              </View>
            )}
          </View>

          <View style={styles.priceQuantityContainer}>
            <View>
              <Text style={styles.priceLabel}>Montant total :</Text>
              <Text style={styles.priceValue}>{delivery.totalAmount ?? 0} dt</Text>
            </View>
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
    backgroundColor: '#877DAB',
  },
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  packageImageContainer: {
    alignItems: 'center',
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
    marginBottom: 5
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
    color: '#877DAB',
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
    backgroundColor: '#F1DBF2',
    borderRadius: 24,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  noDetailsText: {
    fontSize: 16,
    color: '#666666',
  },
  packageImage: {
    width: 270,
    height: 200,
  },
  contactSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,  // réduit de 16
    padding: 12,      // réduit de 16
    marginBottom: 8,  // réduit de 12
    marginHorizontal: 8, // ajouté pour éviter de toucher les bords
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#574599',
    marginBottom: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8, // ou utilise marginLeft dans contactButton si `gap` n'est pas pris en charge
  },
  contactButton: {
    backgroundColor: '#F0EBF8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  contactButtonText: {
    marginLeft: 8,
    color: '#574599',
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
});

export default PackageDetails;