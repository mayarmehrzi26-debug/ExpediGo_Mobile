import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { firebasestore } from '../../FirebaseConfig';
import Statusbagde from '../../src/components/StatusBadge';

interface PackageDetailsRouteParams {
  scannedData: string;
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
  const [locationAddress, setLocationAddress] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

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

          // Fetch destination coordinates and address
          const destCoords = await Location.geocodeAsync(destinationName);
          if (destCoords.length > 0) {
            setDestinationCoords({
              latitude: destCoords[0].latitude,
              longitude: destCoords[0].longitude,
            });
            
            const destAddress = await Location.reverseGeocodeAsync(destCoords[0]);
            if (destAddress.length > 0) {
              setDestinationAddress(`${destAddress[0].name}, ${destAddress[0].city}, ${destAddress[0].region}`);
            }
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

      const address = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (address.length > 0) {
        setLocationAddress(`${address[0].name}, ${address[0].city}, ${address[0].region}`);
      }

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
        setDistanceRemaining(data.routes[0].distance / 1000);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleStartDelivery = () => {
    setConfirmationModalVisible(true);
  };

  const confirmDelivery = async () => {
    setConfirmationModalVisible(false);
    try {
      await updateDoc(doc(firebasestore, 'livraisons', scannedData), {
        status: 'En cours de livraison',
      });
      Alert.alert('Succès', 'La livraison a commencé.');
      setPackageDetails((prevDetails) => ({
        ...prevDetails,
        status: 'En cours de livraison',
      }));
      setIsLiveTracking(true);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      Alert.alert('Erreur', 'Impossible de commencer la livraison.');
    }
  };

  const cancelDelivery = () => {
    setConfirmationModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      {/* Map View */}
      <View style={styles.mapContainer}>
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
        
        {distanceRemaining !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>Distance: {distanceRemaining.toFixed(2)} km</Text>
          </View>
        )}
        
        {!isLiveTracking && packageDetails?.status !== 'En cours de livraison' && (
          <View style={styles.trackingButton}>
            <TouchableOpacity style={styles.startDeliveryButton} onPress={handleStartDelivery}>
              <Text style={styles.startDeliveryButtonText}>Commencez à livrer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Location Info Panel */}
      <View style={styles.locationPanel}>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Localisation de colis</Text>
            <Text style={styles.locationAddress}>{locationAddress || 'Chargement...'}</Text>
          </View>
        </View>
        
        <View style={styles.locationDivider} />
        
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Localisation de client</Text>
            <Text style={styles.locationAddress}>{destinationAddress || packageDetails?.destination || 'Chargement...'}</Text>
          </View>
        </View>
      </View>
      
      {/* Courier Info Panel */}
      <View style={styles.courierPanel}>
        <View style={styles.courierProfileContainer}>
          <View style={styles.courierAvatar}>
            <MaterialCommunityIcons name="truck-delivery" size={22} color="#D73030" />
          </View>
          <View style={styles.courierInfo}>
            <Text style={styles.courierName}>Ahmed Attia</Text>
            <Text style={styles.courierType}>Livreur</Text>
          </View>
          <View style={styles.courierActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="phone" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.packageInfoContainer}>
          <View style={styles.packageInfo}>
            <Text style={styles.packageInfoLabel}>Produit</Text>
            <Text style={styles.packageInfoValue}>{packageDetails?.product}</Text>
          </View>
          <View style={styles.packageStatus}>
            <Statusbagde status={packageDetails?.status} />
          </View>
        </View>
        
        <View style={styles.packageInfoContainer}>
          <View style={styles.packageInfo}>
            <Text style={styles.packageInfoLabel}>Montant</Text>
            <Text style={styles.packageInfoValue}>{packageDetails?.montant} dt</Text>
          </View>
          <View style={styles.packageInfo}>
            <Text style={styles.packageInfoLabel}>Méthode de paiement</Text>
            <Text style={styles.packageInfoValue}>{packageDetails?.payment}</Text>
          </View>
        </View>
      </View>
      
      {/* Confirmation Modal */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  distanceContainer: {
    position: 'absolute',
    top: 60,
    left: '40%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  startDeliveryButton: {
    backgroundColor: '#877DAB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startDeliveryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationPanel: {
    backgroundColor: '#0076C7',
    borderRadius: 12,
    margin: 15,
    padding: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  locationTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  locationLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationAddress: {
    color: 'white',
    fontSize: 14,
  },
  locationDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
    marginLeft: 34,
  },
  courierPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 15,
    marginTop: 0,
  },
  courierProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 15,
  },
  courierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courierInfo: {
    flex: 1,
    marginLeft: 15,
  },
  courierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courierType: {
    fontSize: 14,
    color: '#666',
  },
  courierActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0076C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  packageInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  packageInfo: {},
  packageInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  packageInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  packageStatus: {
    backgroundColor: '#E8F4FF',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#877DAB',
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