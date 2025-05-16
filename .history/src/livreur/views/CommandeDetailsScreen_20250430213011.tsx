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
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '../../config';
import { updateLivraisonStatus } from '../services/commandeService';

const CommandeDetailsScreen = ({ route, navigation }) => {
  const { commande } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  // Vérification des coordonnées
  const hasValidOrigin = commande?.originLat && commande?.originLng;
  const hasValidDestination = commande?.destinationLat && commande?.destinationLng;

  // Récupération position utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.warn('Erreur de localisation:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Ajustement de la carte pour voir tous les points
  const fitToCoordinates = () => {
    if (!mapRef.current) return;

    const coordinates = [];
    
    if (userLocation) {
      coordinates.push(userLocation);
    }
    
    if (hasValidOrigin) {
      coordinates.push({
        latitude: commande.originLat,
        longitude: commande.originLng,
      });
    }
    
    if (hasValidDestination) {
      coordinates.push({
        latitude: commande.destinationLat,
        longitude: commande.destinationLng,
      });
    }

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // Zoom automatique au chargement
  useEffect(() => {
    if (!loading && mapRef.current) {
      fitToCoordinates();
    }
  }, [loading, mapRef.current]);

  const handleStatusUpdate = async (newStatus) => {
    const success = await updateLivraisonStatus(commande.id, newStatus);
    if (success) {
      navigation.goBack();
      navigation.navigate('MesCommandes', { refresh: true });
    }
  };

  const openMaps = (lat, lng, label) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
    Linking.openURL(url).catch(err => Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps'));
  };

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
            initialRegion={{
              latitude: 48.8566,
              longitude: 2.3522,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            onMapReady={fitToCoordinates}
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

            {/* Trajet */}
            {GOOGLE_MAPS_API_KEY && hasValidOrigin && hasValidDestination ? (
              <MapViewDirections
                origin={{ latitude: commande.originLat, longitude: commande.originLng }}
                destination={{ latitude: commande.destinationLat, longitude: commande.destinationLng }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor="#44076a"
                onReady={fitToCoordinates}
              />
            ) : (
              hasValidOrigin &&
              hasValidDestination && (
                <Polyline
                  coordinates={[
                    { latitude: commande.originLat, longitude: commande.originLng },
                    { latitude: commande.destinationLat, longitude: commande.destinationLng },
                  ]}
                  strokeColor="#44076a"
                  strokeWidth={4}
                />
              )
            )}
          </MapView>

          {/* Boutons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={fitToCoordinates}>
              <MaterialIcons name="my-location" size={24} color="#44076a" />
            </TouchableOpacity>

            <View style={styles.directionButtons}>
              {hasValidOrigin && (
                <TouchableOpacity
                  style={styles.directionButton}
                  onPress={() => openMaps(commande.originLat, commande.originLng, 'Origine')}>
                  <MaterialIcons name="directions" size={20} color="white" />
                  <Text style={styles.buttonText}>Origine</Text>
                </TouchableOpacity>
              )}

              {hasValidDestination && (
                <TouchableOpacity
                  style={styles.directionButton}
                  onPress={() => openMaps(commande.destinationLat, commande.destinationLng, 'Destination')}>
                  <MaterialIcons name="directions" size={20} color="white" />
                  <Text style={styles.buttonText}>Destination</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la livraison</Text>
          
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
            <Text style={styles.detailValue}>{commande.status}</Text>
          </View>
        </View>

        {/* Adresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>De:</Text>
            <Text style={styles.detailValue}>{commande.origin || 'Non spécifié'}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="flag" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>À:</Text>
            <Text style={styles.detailValue}>{commande.destination || 'Non spécifié'}</Text>
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
    height: 400,
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  directionButton: {
    backgroundColor: '#44076a',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    width: 80,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
});

export default CommandeDetailsScreen;