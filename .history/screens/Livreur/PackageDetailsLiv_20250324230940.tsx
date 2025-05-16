import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back button
import * as Location from 'expo-location';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../../FirebaseConfig';
import Statusbagde from '../../src/components/StatusBadge';

interface PackageDetailsRouteParams {
  scannedData: string; // Tracking code of the delivery
}

interface PackageDetailsProps {
  route: { params: PackageDetailsRouteParams };
  navigation: any;
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

const PackageDetailsLiv: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);

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

          // Fetch destination coordinates
          const destCoords = await Location.geocodeAsync(destinationName);
          if (destCoords.length > 0) {
            setDestinationCoords({
              latitude: destCoords[0].latitude,
              longitude: destCoords[0].longitude,
            });
          }
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (destinationCoords) {
        fetchRoute(currentLocation.coords, destinationCoords);
      }
    })();
  }, [destinationCoords]);

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoords(coordinates);
        setDistanceRemaining(data.routes[0].distance / 1000); // Convert meters to kilometers
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente d'enlèvement":
        return { backgroundColor: '#F06292', color: '#22C55E' };
      case 'En cours de livraison':
        return { backgroundColor: '#DBEAFE', color: '#3B82F6' };
      case 'Livré':
        return { backgroundColor: '#FEF9C3', color: '#F59E0B' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    }
  };

  const handleStartDelivery = () => {
    setConfirmationModalVisible(true); // Afficher la modal de confirmation
  };

  const confirmDelivery = async () => {
    setConfirmationModalVisible(false); // Fermer la modal
    try {
      // Mettre à jour le statut de la livraison dans Firestore
      await updateDoc(doc(firebasestore, 'livraisons', scannedData), {
        status: 'En cours de livraison',
      });
      Alert.alert('Succès', 'La livraison a commencé.');
      // Mettre à jour l'état local
      setPackageDetails((prevDetails) => ({
        ...prevDetails,
        status: 'En cours de livraison',
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      Alert.alert('Erreur', 'Impossible de commencer la livraison.');
    }
  };
  const cancelDelivery = () => {
    setConfirmationModalVisible(false); // Fermer la modal
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
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
  
      {/* Map View as Background */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 36.8065,
          longitude: location?.coords.longitude || 10.1815,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Votre position"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#0076C7"
          />
        )}
      </MapView>
  
      {/* Overlay for Package Details */}
      <View style={styles.overlay}>
        <ScrollView style={styles.detailsScrollView}>
          {packageDetails ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>Commande #{packageDetails.deliveryId}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusColor(packageDetails.status)]}>
              <Statusbagde status={packageDetails.status} />
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{' '}
                  <Text style={styles.boldText}>{packageDetails.destination}</Text> pour le client{' '}
                  <Text style={styles.boldText}>{packageDetails.client}</Text>.
                </Text>
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
                <View>
                  <Text style={styles.priceLabel}>Montant total :</Text>
                  <Text style={styles.priceValue}>{packageDetails.montant} dt</Text>
                </View>
              </View>
              {/* Move the button here in the card */}
              <TouchableOpacity
                style={styles.startDeliveryButton}
                onPress={handleStartDelivery}
              >
                <Text style={styles.startDeliveryButtonText}>Commencez à livrer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noDetailsContainer}>
              <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette livraison.</Text>
            </View>
          )}
        </ScrollView>
      </View>
  
      {/* Modal de confirmation */}
      <Modal
        visible={isConfirmationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConfirmationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Vous allez commencer la livraison maintenant ?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelivery}
              >
                <Text style={styles.modalButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelivery}
              >
                <Text style={styles.modalButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#666666',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 20,
  },
  map: {
    height: 360,
    
  },
  overlay: {
    flex: 1,
    borderRadius: 56,
    
  },
  detailsScrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 16,

  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    alignSelf:"flex-end",
    borderRadius:20,
    paddingLeft:8,
    marginBottom: 16,

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
    fontSize: 12,
    color: '#666666',
  },
  priceValue: {
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#877DAB',
  },
  startDeliveryButton: {
    position: 'absolute',
    bottom: 10,
    left: 90,
    right: 90,
    marginTop:40,
    backgroundColor: '#877DAB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startDeliveryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#0076C7',
  },
  cancelButton: {
    backgroundColor: '#F06292',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PackageDetailsLiv;