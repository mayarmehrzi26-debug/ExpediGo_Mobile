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
  const [products, setProducts] = useState<any[]>([]);

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
        
        // Récupération des données client
        const clientDoc = deliveryData.client ? await getDoc(doc(firebasestore, 'clients', deliveryData.client)) : null;
        const clientData = clientDoc?.exists() ? clientDoc.data() : null;

        // Récupération des données d'adresse
        const addressDoc = deliveryData.address ? await getDoc(doc(firebasestore, 'adresses', deliveryData.address)) : null;
        const addressData = addressDoc?.exists() ? addressDoc.data() : null;

        // Récupération des données du livreur
        const assignedToDoc = deliveryData.assignedTo ? await getDoc(doc(firebasestore, 'users', deliveryData.assignedTo)) : null;
        const assignedToData = assignedToDoc?.exists() ? assignedToDoc.data() : null;

        // Récupération des produits (compatible avec ancienne et nouvelle structure)
        let productsList = [];
        if (Array.isArray(deliveryData.products)) {
          // Nouvelle structure avec plusieurs produits
          for (const productItem of deliveryData.products) {
            const productDoc = await getDoc(doc(firebasestore, 'products', productItem.productId));
            if (productDoc.exists()) {
              productsList.push({
                id: productItem.productId,
                name: productDoc.data()?.name || 'Produit inconnu',
                quantity: productItem.quantity || 1,
                price: productItem.price || productDoc.data()?.amount || 0,
                image: productDoc.data()?.imageUrl || null
              });
            }
          }
        } else if (deliveryData.product) {
          // Ancienne structure avec un seul produit
          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          if (productDoc.exists()) {
            productsList.push({
              id: deliveryData.product,
              name: productDoc.data()?.name || 'Produit inconnu',
              quantity: deliveryData.quantity || 1,
              price: deliveryData.totalAmount || productDoc.data()?.amount || 0,
              image: productDoc.data()?.imageUrl || null
            });
          }
        }

        setProducts(productsList);

        setDelivery({
          id: deliveryId,
          ...deliveryData,
          client: clientData?.name || 'Client inconnu',
          destination: clientData?.address || 'Adresse inconnue',
          address: addressData?.address || 'Adresse inconnue',
          livreur: assignedToData?.name || 'Non assigné',
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

  // Calcul du nom du produit principal pour l'affichage (compatibilité)
  const mainProduct = products.length > 0 ? products[0].name : 'Produit inconnu';

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
                  <Text style={styles.sectionTitle}>{delivery.livreur}</Text>
                  <Text style={styles.descriptionText}>Livreur</Text>
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
            
            {(delivery.status === "En cours de pickup" || delivery.status === "En cours de livraison") && (
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
            <Text style={styles.productsTitle}>Produits ({products.length})</Text>
            
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productDetails}>
                    <View style={styles.detailBadge}>
                      <Icon name="numeric" size={14} color="#877DAB" />
                      <Text style={styles.detailBadgeText}>{product.quantity}</Text>
                    </View>
                    <View style={styles.detailBadge}>
                     
                      <Text style={styles.detailBadgeText}>{product.price} DT/unité</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.productTotal}>
                  {product.price * product.quantity} DT
                </Text>
              </View>
            ))}
            
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
   productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#574599',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
  },

  productDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailBadgeText: {
    fontSize: 12,
    color: '#574599',
    marginLeft: 4,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#574599',
    marginLeft: 8,
  },

});

export default PackageDetails;