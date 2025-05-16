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

  // Calcul du point central et du zoom
  const calculateRegion = () => {
    const points = [];
    
    if (userLocation) points.push(userLocation);
    if (hasValidOrigin) points.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (hasValidDestination) points.push({
      latitude: commande.destinationLat,
      longitude: commande.destinationLng
    });

    if (points.length === 0) {
      return {
        latitude: 48.8566, // Paris par défaut
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

    const padding = 0.05; // Padding supplémentaire
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
    if (hasValidOrigin) coordinates.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (hasValidDestination) coordinates.push({
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

  // Gestion des actions
  const handleStatusUpdate = async (newStatus) => {
    const success = await updateLivraisonStatus(commande.id, newStatus);
    if (success) {
      navigation.goBack();
      navigation.navigate('MesCommandes', { refresh: true });
    }
  };

  const openMaps = (lat, lng, label) => {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    Linking.openURL(url).catch(err => Alert.alert('Erreur', 'Impossible d\'ouvrir la carte'));
  };

  // Texte du bouton selon le statut
  const getActionButtonText = () => {
    switch (commande.status) {
      case "Non traité": return "Prendre en charge";
      case "En attente d'enlèvement": return "Commencer le pickup";
      case "Picked": return "Commencer la livraison";
      case "En cours de livraison": return "Terminer la livraison";
      default: return "";
    }
  };

  // Couleur du bouton selon le statut
  const getActionButtonColor = () => {
    switch (commande.status) {
      case "Non traité": return "#44076a";
      case "En attente d'enlèvement": return "#877DAB";
      case "Picked": return "#5D8BF4";
      case "En cours de livraison": return "#4CAF50";
      default: return "#44076a";
    }
  };

  // Afficher le bouton d'action seulement si nécessaire
  const shouldShowActionButton = () => {
    return ["Non traité", "En attente d'enlèvement", "Picked", "En cours de livraison"].includes(commande.status);
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

            {/* Ligne entre origine et destination */}
            {hasValidOrigin && hasValidDestination && (
              <Polyline
                coordinates={[
                  { latitude: commande.originLat, longitude: commande.originLng },
                  { latitude: commande.destinationLat, longitude: commande.destinationLng },
                ]}
                strokeColor="#44076a"
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
                onPress={() => openMaps(commande.originLat, commande.originLng, 'Origine')}>
                <MaterialIcons name="directions" size={24} color="#44076a" />
              </TouchableOpacity>
            )}

            {hasValidDestination && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => openMaps(commande.destinationLat, commande.destinationLng, 'Destination')}>
                <MaterialIcons name="flag" size={24} color="#44076a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bouton d'action principal */}
        {shouldShowActionButton() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getActionButtonColor() }]}
            onPress={() => {
              switch (commande.status) {
                case "Non traité":
                  handleStatusUpdate("En attente d'enlèvement");
                  break;
                case "En attente d'enlèvement":
                  handleStatusUpdate("Picked");
                  break;
                case "Picked":
                  handleStatusUpdate("En cours de livraison");
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
            }}>
            <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
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
            <Text style={styles.detailValue}>{commande.status}</Text>
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