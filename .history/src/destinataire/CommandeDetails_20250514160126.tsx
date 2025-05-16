import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import Header from "../../src/components/Header";
import StatusBadge from "../../src/components/StatusBadge";
import { LivraisonModel } from '../livraison/models/LivraisonModel';
import { CommandesPresenter } from '../livraison/presenters/CommandesPresenter';

type CommandeDetailsRouteProp = RouteProp<RootStackParamList, 'CommandeDetails'>;

interface CommandeDetailsProps {
  route: CommandeDetailsRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'CommandeDetails'>;
}

interface CommandeDetailsData {
  id: string;
  origin: string;
  destination: string;
  expediteurName: string;
  expediteurPhone: string;
  status: string;
  payment: string;
  isFragile: boolean;
  createdAt: Date;
  totalAmount: number;
  livreur: string;
  notes: string;
  productName: string;
  productDescription: string;
  livreurPhone: string;
  expediteurId: string;
  assignedTo?: string;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
}

const CommandeDetails: React.FC<CommandeDetailsProps> = ({ route, navigation }) => {
  const { commandeId } = route.params;
  const [commande, setCommande] = useState<CommandeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [presenter] = useState(new CommandesPresenter());
  const [model] = useState(new LivraisonModel());
  const [livreurLocation, setLivreurLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp?: Date;
  } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchCommandeDetails = async () => {
      try {
        setLoading(true);
        const commandeDetails = await presenter.fetchCommandeDetails(commandeId);
        
        if (!commandeDetails) {
          console.log('Commande non trouvée');
          return;
        }
  
        setCommande({
          id: commandeId,
          assignedTo: commandeDetails.assignedTo,
          expediteurId: commandeDetails.createdBy,
          origin: commandeDetails.originAddress || 'Adresse inconnue',
          destination: commandeDetails.destination || 'Adresse inconnue',
          expediteurName: commandeDetails.expediteurName,
          expediteurPhone: commandeDetails.expediteurPhone,
          status: commandeDetails.status || 'En attente',
          payment: commandeDetails.payment || 'Non spécifié',
          isFragile: commandeDetails.isFragile || false,
          createdAt: commandeDetails.createdAt || new Date(),
          totalAmount: commandeDetails.totalAmount || 0,
          livreur: commandeDetails.livreurName || 'Non assigné',
          livreurPhone: commandeDetails.livreurPhone || '',
          notes: commandeDetails.notes || '',
          productName: commandeDetails.productName || 'Produit inconnu',
          productDescription: commandeDetails.productDescription || '',
          originLat: commandeDetails.originLat,
          originLng: commandeDetails.originLng,
          destinationLat: commandeDetails.destinationLat,
          destinationLng: commandeDetails.destinationLng
        });
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommandeDetails();
  }, [commandeId, presenter]);

  // Écouter la position du livreur en temps réel
  useEffect(() => {
    if (!commande?.assignedTo) return;

    const livreurLocationRef = doc(firebasestore, "livreurLocations", commande.assignedTo);
    const unsubscribe = onSnapshot(livreurLocationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLivreurLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp?.toDate()
        });
      }
    });

    return () => unsubscribe();
  }, [commande?.assignedTo]);

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleSendMessage = async () => {
    try {
      if (!currentUser) {
        console.error("Aucun utilisateur connecté");
        return;
      }
  
      if (!commande?.expediteurId) {
        console.error("ID expéditeur manquant");
        return;
      }
  
      const participants = [currentUser.uid, commande.expediteurId];
      let conversationId = await model.findExistingConversation(participants);
      
      if (!conversationId) {
        conversationId = await model.createConversation(participants);
      }
  
      navigation.navigate('ChatScreen', { 
        conversationId,
        recipientName: commande.expediteurName
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };
  
  const handleCall = () => {
    if (commande?.expediteurPhone) {
      Linking.openURL(`tel:${commande.expediteurPhone}`);
    }
  };
  
  const handleCallLivreur = () => {
    if (commande?.livreurPhone) {
      Linking.openURL(`tel:${commande.livreurPhone}`);
    }
  };
  
  const handleMessageLivreur = async () => {
    try {
      if (!currentUser || !commande?.assignedTo) {
        console.error("Aucun utilisateur connecté ou livreur non assigné");
        return;
      }
  
      const participants = [currentUser.uid, commande.assignedTo];
      let conversationId = await model.findExistingConversation(participants);
      
      if (!conversationId) {
        conversationId = await model.createConversation(participants);
      }
  
      navigation.navigate('ChatScreen', { 
        conversationId,
        recipientName: commande.livreur
      });
    } catch (error) {
      console.error("Error starting conversation with livreur:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  if (!commande) {
    return (
      <View style={styles.container}>
        <Header title="Détails de commande" showBackButton={true} />
        <View style={styles.noDetailsContainer}>
          <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette commande</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Détails de commande" 
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
                <Text style={styles.sectionTitle}>{commande.expediteurName}</Text>
                <Text style={styles.descriptionText}>Expéditeur</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleSendMessage}
                >
                  <Icon name="message-text" size={20} color="#44076a" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleCall}
                >
                  <Icon name="phone" size={20} color="#44076a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {commande.status !== "Non traité" && commande.status !== "Annulée" && (
            <View style={styles.contactSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.sectionTitle}>Livreur</Text>
                  <Text style={styles.descriptionText}>{commande.livreur}</Text>
                </View>
                <View style={styles.contactButtons}>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={toggleMap}
                  >
                    <Icon name={showMap ? "map-marker-off" : "map-marker"} size={20} color="#44076a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={handleMessageLivreur}
                  >
                    <Icon name="message-text" size={20} color="#44076a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={handleCallLivreur}
                  >
                    <Icon name="phone" size={20} color="#44076a" />
                  </TouchableOpacity>
                </View>
              </View>

              {showMap && livreurLocation && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: livreurLocation.latitude,
                      longitude: livreurLocation.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: livreurLocation.latitude,
                        longitude: livreurLocation.longitude
                      }}
                      title="Position du livreur"
                      description={`Dernière mise à jour: ${livreurLocation.timestamp?.toLocaleTimeString() || 'inconnue'}`}
                    >
                      <Icon name="truck-delivery" size={24} color="#EA4335" />
                    </Marker>

                    {commande.originLat && commande.originLng && (
                      <Marker
                        coordinate={{
                          latitude: commande.originLat,
                          longitude: commande.originLng,
                        }}
                        title="Origine"
                        pinColor="#FBBC05"
                      />
                    )}

                    {commande.destinationLat && commande.destinationLng && (
                      <Marker
                        coordinate={{
                          latitude: commande.destinationLat,
                          longitude: commande.destinationLng,
                        }}
                        title="Destination"
                        pinColor="#34A853"
                      />
                    )}
                  </MapView>
                </View>
              )}
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.productName}>Commande #{commande.id.substring(0, 8)}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <StatusBadge status={commande.status} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              De <Text style={styles.boldText}>{commande.origin}</Text> vers <Text style={styles.boldText}>{commande.destination}</Text>
            </Text>
            
            {commande.status === "En attente d'enlèvement" && (
              <TouchableOpacity 
                style={styles.routeButton} 
                onPress={() => navigation.navigate('TrackingScreen', { 
                  deliveryId: commande.id,
                  fromAddress: commande.origin,
                  toAddress: commande.destination
                })}
              >
                <Icon name="map-marker-path" size={16} color="#44076a" />
                <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>
         
          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Icon name="credit-card" size={16} color="#44076a" />
              <Text style={styles.infoBadgeText}>{commande.payment}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Icon name="calendar" size={16} color="#44076a" />
              <Text style={styles.infoBadgeText}>
                {commande.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Produit</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productNameText}>{commande.productName}</Text>
              {commande.productDescription && (
                <Text style={styles.productDescription}>{commande.productDescription}</Text>
              )}
            </View>
          </View>

          <View style={styles.priceQuantityContainer}>
            <View>
              <Text style={styles.priceLabel}>Montant total :</Text>
              <Text style={styles.priceValue}>{commande.totalAmount ?? 0} dt</Text>
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
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#44076a',
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#F0EBF8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',            
  },
  productInfo: {
    marginTop: 0,                     
    alignItems: 'flex-end',          
  },
  productNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default CommandeDetails;