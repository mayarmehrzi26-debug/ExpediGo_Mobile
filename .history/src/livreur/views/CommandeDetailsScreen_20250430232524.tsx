import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { updateLivraisonStatus } from '../services/commandeService';

const DISTANCE_THRESHOLD = 0.02; // ~2km en degrés

const CommandeDetailsScreen = ({ route }) => {
  const { commande: initialCommande } = route.params;
  const [commande, setCommande] = useState(initialCommande);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOriginRoute, setShowOriginRoute] = useState(false);
  const [showDestinationRoute, setShowDestinationRoute] = useState(false);
  const mapRef = useRef(null);
  const locationWatchRef = useRef(null);

  // Vérification des coordonnées
  const hasValidOrigin = commande?.originLat && commande?.originLng;
  const hasValidDestination = commande?.destinationLat && commande?.destinationLng;

  // Calcul de distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  // Vérifier la proximité
  const checkProximity = (location, targetLat, targetLng) => {
    if (!location || !targetLat || !targetLng) return false;
    return calculateDistance(
      location.latitude,
      location.longitude,
      targetLat,
      targetLng
    ) < DISTANCE_THRESHOLD;
  };

  // Surveiller la position en temps réel
  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // Position actuelle
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    // Surveillance continue
    locationWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100, // Mettre à jour tous les 100m
      },
      (newLocation) => {
        const newPos = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };
        setUserLocation(newPos);

        // Vérifier la proximité avec l'origine
        if (
          showOriginRoute &&
          hasValidOrigin &&
          checkProximity(newPos, commande.originLat, commande.originLng)
        ) {
          Alert.alert(
            'Arrivé à l\'origine',
            'Avez-vous pris le colis ?',
            [
              {
                text: 'Non',
                style: 'cancel',
              },
              {
                text: 'Oui',
                onPress: () => {
                  handleStatusUpdate('Picked');
                  setShowOriginRoute(false);
                },
              },
            ]
          );
        }

        // Vérifier la proximité avec la destination
        if (
          showDestinationRoute &&
          hasValidDestination &&
          checkProximity(newPos, commande.destinationLat, commande.destinationLng)
        ) {
          Alert.alert(
            'Arrivé à destination',
            'Avez-vous livré le colis ?',
            [
              {
                text: 'Non',
                style: 'cancel',
              },
              {
                text: 'Oui',
                onPress: () => {
                  handleStatusUpdate('Livré');
                  setShowDestinationRoute(false);
                },
              },
            ]
          );
        }
      }
    );
  };

  useEffect(() => {
    startLocationTracking();
    return () => {
      if (locationWatchRef.current) {
        locationWatchRef.current.remove();
      }
    };
  }, [showOriginRoute, showDestinationRoute]);

  // Calcul du point central et du zoom
  const calculateRegion = () => {
    const points = [];
    
    if (userLocation) points.push(userLocation);
    if (showOriginRoute && hasValidOrigin) points.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (showDestinationRoute && hasValidDestination) points.push({
      latitude: commande.destinationLat,
      longitude: commande.destinationLng
    });

    if (points.length === 0) {
      return {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    // Calcul des limites
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    const padding = 0.05;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + padding,
      longitudeDelta: (maxLng - minLng) + padding,
    };
  };

  // Zoom sur tous les points
  const zoomToMarkers = () => {
    if (!mapRef.current) return;

    const coordinates = [];
    if (userLocation) coordinates.push(userLocation);
    if (showOriginRoute && hasValidOrigin) coordinates.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (showDestinationRoute && hasValidDestination) coordinates.push({
      latitude: commande.destinationLat,
      longitude: commande.destinationLng
    });

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // Mise à jour du statut
  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const success = await updateLivraisonStatus(commande.id, newStatus);
      if (success) {
        setCommande(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  // Gestion des actions principales
  const handleMainAction = () => {
    switch (commande.status) {
      case "Non traité":
        handleStatusUpdate("En attente d'enlèvement");
        break;
      case "En attente d'enlèvement":
        setShowOriginRoute(true);
        setShowDestinationRoute(false);
        Alert.alert('Suivi activé', 'Le trajet vers l\'origine est affiché');
        break;
      case "Picked":
        setShowOriginRoute(false);
        setShowDestinationRoute(true);
        handleStatusUpdate("En cours de livraison");
        Alert.alert('Suivi activé', 'Le trajet vers la destination est affiché');
        break;
      case "En cours de livraison":
        Alert.alert(
          "Confirmer la livraison",
          "Avez-vous livré le colis au destinataire ?",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            { 
              text: "Livraison réussie",
              onPress: () => handleStatusUpdate("Livré")
            },
            {
              text: "Retour/Problème",
              onPress: () => handleStatusUpdate("Retour"),
              style: "destructive"
            }
          ]
        );
        break;
    }
  };

  const openMaps = (lat, lng, label) => {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    Linking.openURL(url).catch(err => Alert.alert('Erreur', 'Impossible d\'ouvrir la carte'));
  };

  // Infos du bouton principal
  const getActionButtonInfo = () => {
    switch (commande.status) {
      case "Non traité": 
        return { text: "Prendre en charge", color: "#44076a" };
      case "En attente d'enlèvement": 
        return { text: "Commencer le pickup", color: "#877DAB" };
      case "Picked": 
        return { text: "Commencer la livraison", color: "#5D8BF4" };
      case "En cours de livraison": 
        return { text: "Terminer la livraison", color: "#4CAF50" };
      default: 
        return { text: "", color: "#44076a" };
    }
  };

  const { text: actionButtonText, color: actionButtonColor } = getActionButtonInfo();
  const showActionButton = ["Non traité", "En attente d'enlèvement", "Picked", "En cours de livraison"].includes(commande.status);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Carte */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={calculateRegion()}
            onMapReady={zoomToMarkers}
          >
            {/* Marqueurs */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Votre position"
                pinColor="#4285F4"
              />
            )}

            {hasValidOrigin && (
              <Marker
                coordinate={{
                  latitude: commande.originLat,
                  longitude: commande.originLng,
                }}
                title="Origine"
                description={commande.origin}
                pinColor="#FBBC05"
              />
            )}

            {hasValidDestination && (
              <Marker
                coordinate={{
                  latitude: commande.destinationLat,
                  longitude: commande.destinationLng,
                }}
                title="Destination"
                description={commande.destination}
                pinColor="#34A853"
              />
            )}

            {/* Ligne vers l'origine */}
            {showOriginRoute && userLocation && hasValidOrigin && (
              <Polyline
                coordinates={[
                  userLocation,
                  { latitude: commande.originLat, longitude: commande.originLng },
                ]}
                strokeColor="#FBBC05"
                strokeWidth={4}
              />
            )}

            {/* Ligne vers la destination */}
            {showDestinationRoute && userLocation && hasValidDestination && (
              <Polyline
                coordinates={[
                  userLocation,
                  { latitude: commande.destinationLat, longitude: commande.destinationLng },
                ]}
                strokeColor="#34A853"
                strokeWidth={4}
              />
            )}
          </MapView>

          {/* Boutons de contrôle */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={zoomToMarkers}>
              <MaterialIcons name="zoom-out-map" size={24} color="#44076a" />
            </TouchableOpacity>

            {hasValidOrigin && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  setShowOriginRoute(true);
                  setShowDestinationRoute(false);
                  zoomToMarkers();
                }}>
                <MaterialIcons name="directions" size={24} color="#44076a" />
              </TouchableOpacity>
            )}

            {hasValidDestination && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  setShowOriginRoute(false);
                  setShowDestinationRoute(true);
                  zoomToMarkers();
                }}>
                <MaterialIcons name="flag" size={24} color="#44076a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bouton d'action principal */}
        {showActionButton && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: actionButtonColor }]}
            onPress={handleMainAction}
            disabled={updating}>
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.actionButtonText}>{actionButtonText}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de livraison</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="local-shipping" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>N° Commande:</Text>
            <Text style={styles.detailValue}>{commande.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{commande.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>Statut:</Text>
            <Text style={[styles.detailValue, { color: actionButtonColor, fontWeight: 'bold' }]}>
              {commande.status}
            </Text>
          </View>
        </View>

        {/* Adresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinéraire</Text>
          
          <View style={styles.addressCard}>
            <MaterialIcons name="place" size={24} color="#FBBC05" />
            <View style={styles.addressText}>
              <Text style={styles.addressTitle}>Départ</Text>
              <Text style={styles.addressValue}>{commande.origin || 'Non spécifié'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.addressCard}>
            <MaterialIcons name="flag" size={24} color="#34A853" />
            <View style={styles.addressText}>
              <Text style={styles.addressTitle}>Destination</Text>
              <Text style={styles.addressValue}>{commande.destination || 'Non spécifié'}</Text>
            </View>
          </View>
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
  scrollContainer: {
    paddingBottom: 20,
  },
  mapContainer: {
    height: 350,
    width: '100%',
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  controlButton: {
    padding: 8,
  },
  actionButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addressText: {
    marginLeft: 15,
    flex: 1,
  },
  addressTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  addressValue: {
    color: '#666',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 5,
  },
});

export default CommandeDetailsScreen;