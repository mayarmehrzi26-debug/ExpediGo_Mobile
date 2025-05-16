import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  AppState, 
  Linking, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { firebasestore } from "../../FirebaseConfig";
import Statusbagde from "../../src/components/StatusBadge";

const LOCATION_TASK_NAME = "background-location-task";

// Définition de la tâche de suivi en arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      console.log("Background location update:", location);
    }
  }
});

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

const PackageDetailsLiv: React.FC<PackageDetailsProps> = ({
  route,
  navigation,
}) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = 
    useState<Location.LocationSubscription | null>(null);
  const [isStartingTracking, setIsStartingTracking] = useState(false);

  const startBackgroundTracking = async () => {
    try {
      const { granted } = await Location.getBackgroundPermissionsAsync();
      if (!granted) {
        throw new Error("Permission de localisation en arrière-plan non accordée");
      }

      if (AppState.currentState !== 'active') {
        throw new Error("L'application doit être au premier plan pour démarrer le suivi");
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Suivi de livraison",
          notificationBody: "En cours... Cliquez pour revenir à l'app",
          notificationColor: "#877DAB",
        },
        pausesUpdatesAutomatically: false,
      });

      return true;
    } catch (error) {
      console.error("Échec du démarrage du suivi:", error);
      throw error;
    }
  };

  const startTrackingWithRetry = async (attempts = 0): Promise<boolean> => {
    try {
      setIsStartingTracking(true);
      const result = await startBackgroundTracking();
      return result;
    } catch (error) {
      if (attempts < 2 && error.message.includes('foreground service')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return startTrackingWithRetry(attempts + 1);
      }
      throw error;
    } finally {
      setIsStartingTracking(false);
    }
  };

  const stopBackgroundTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
      console.log("Le suivi était déjà arrêté");
    }
  };

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!scannedData) {
        console.error("Aucun code de suivi fourni.");
        setLoading(false);
        return;
      }

      try {
        const deliveryDoc = await getDoc(
          doc(firebasestore, "livraisons", scannedData)
        );
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data() as Delivery;

          const [clientDoc, destinationDoc, productDoc, addressDoc] = await Promise.all([
            getDoc(doc(firebasestore, "clients", deliveryData.client)),
            getDoc(doc(firebasestore, "clients", deliveryData.client)),
            getDoc(doc(firebasestore, "products", deliveryData.product)),
            getDoc(doc(firebasestore, "adresses", deliveryData.address))
          ]);

          const mergedData: PackageDetails = {
            deliveryId: deliveryData.id,
            address: addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue",
            client: clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu",
            product: productDoc.exists() ? productDoc.data()?.name : "Produit inconnu",
            destination: destinationDoc.exists() ? destinationDoc.data()?.address : "Adresse inconnue",
            payment: deliveryData.payment,
            isExchange: deliveryData.isExchange,
            isFragile: deliveryData.isFragile,
            status: deliveryData.status,
            createdAt: deliveryData.createdAt.toDate(),
            montant: deliveryData.totalAmount,
          };

          setPackageDetails(mergedData);

          const destCoords = await Location.geocodeAsync(mergedData.destination);
          if (destCoords.length > 0) {
            setDestinationCoords({
              latitude: destCoords[0].latitude,
              longitude: destCoords[0].longitude,
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès à la localisation en arrière-plan",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Paramètres", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    };

    initLocation();
  }, []);

  useEffect(() => {
    if (location && destinationCoords) {
      fetchRoute(location.coords, destinationCoords);
    }
  }, [location, destinationCoords]);

  useEffect(() => {
    return () => {
      locationSubscription?.remove();
      stopBackgroundTracking();
    };
  }, [locationSubscription]);
  const fetchRoute = async (
    start: Location.LocationObject['coords'],
    end: { latitude: number; longitude: number }
  ) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );
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
      if (packageDetails?.status === "En cours de livraison") {
        locationSubscription?.remove();
        await stopBackgroundTracking();
        setIsTracking(false);

        await updateDoc(doc(firebasestore, "livraisons", scannedData), {
          status: "Livré",
        });

        Alert.alert("Succès", "Livraison terminée!");
      } else {
        const trackingStarted = await startTrackingWithRetry();
        if (!trackingStarted) return;

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setLocation(newLocation);
            if (destinationCoords) {
              fetchRoute(newLocation.coords, destinationCoords);
            }
          }
        );

        setLocationSubscription(subscription);
        setIsTracking(true);

        await updateDoc(doc(firebasestore, "livraisons", scannedData), {
          status: "En cours de livraison",
        });
      }

      setPackageDetails(prev => prev ? {
        ...prev,
        status: prev.status === "En cours de livraison" ? "Livré" : "En cours de livraison"
      } : null);
    } catch (error) {
      Alert.alert(
        "Erreur", 
        error.message.includes('foreground service')
          ? "Veuillez garder l'application ouverte pour démarrer le suivi"
          : "Une erreur est survenue"
      );
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
    <View style={styles.container}>
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
            <Marker coordinate={destinationCoords} title="Destination" />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#0076C7"
            />
          )}
        </MapView>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.contentScrollView}>
        <View style={styles.card}>
          {packageDetails ? (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>
                  Commande #{packageDetails.deliveryId}
                </Text>
                <Statusbagde status={packageDetails.status} />
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{" "}
                  <Text style={styles.boldText}>{packageDetails.destination}</Text> pour{" "}
                  <Text style={styles.boldText}>{packageDetails.client}</Text>
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
              </View>

              <View style={styles.priceQuantityContainer}>
                <View>
                  <Text style={styles.priceLabel}>Montant total :</Text>
                  <Text style={styles.priceValue}>{packageDetails.montant} dt</Text>
                </View>
              </View>

              {packageDetails?.status !== "Livré" && (
                <TouchableOpacity
                  style={[
                    styles.startDeliveryButton,
                    packageDetails?.status === "En cours de livraison" && {
                      backgroundColor: "#4CAF50",
                    },
                    isStartingTracking && { opacity: 0.7 },
                  ]}
                  onPress={handleStartDelivery}
                  disabled={isStartingTracking}
                >
                  {isStartingTracking ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.startDeliveryButtonText}>
                        {packageDetails?.status === "En cours de livraison"
                          ? "Terminer la livraison"
                          : "Commencez à livrer"}
                      </Text>
                      {packageDetails?.status === "En cours de livraison" && (
                        <Text style={styles.trackingStatusText}>Suivi en cours...</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noDeliveriesText}>
              Aucun détail trouvé pour cette livraison.
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isConfirmationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelDelivery}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {packageDetails?.status === "En cours de livraison"
                ? "Terminer la livraison maintenant ?"
                : "Démarrer le suivi de livraison maintenant ?"}
            </Text>
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
    backgroundColor: "#F7F7F7",
  },
  mapContainer: {
    height: 300,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 20,
  },
  contentScrollView: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#F7F7F7",
    paddingTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 15,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666666",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333333",
  },
  infoBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
  },
  detailsContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  priceQuantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#877DAB",
  },
  startDeliveryButton: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  startDeliveryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  trackingStatusText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#877DAB",
  },
  cancelButton: {
    backgroundColor: "#F06292",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PackageDetailsLiv;