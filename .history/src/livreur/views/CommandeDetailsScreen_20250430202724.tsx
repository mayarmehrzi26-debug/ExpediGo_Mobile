import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import { updateLivraisonStatus } from "../services/commandeService";

// Fonction utilitaire pour vérifier les coordonnées
const isValidCoordinate = (coord) => {
  return coord !== null && coord !== undefined && !isNaN(coord) && 
         Math.abs(coord) <= 180; // Vérifie que c'est une valeur GPS valide
};

const CommandeDetailsScreen = ({ route, navigation }) => {
  const { commande } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Vérification des coordonnées avec tolérance
  const hasValidOrigin = isValidCoordinate(commande?.originLat) && isValidCoordinate(commande?.originLng);
  const hasValidDestination = isValidCoordinate(commande?.destinationLat) && isValidCoordinate(commande?.destinationLng);
  
  // Région par défaut centrée sur Paris
  const defaultRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Calcul de la région optimale pour la carte
  const getMapRegion = () => {
    if (hasValidOrigin && hasValidDestination) {
      return {
        latitude: (commande.originLat + commande.destinationLat) / 2,
        longitude: (commande.originLng + commande.destinationLng) / 2,
        latitudeDelta: Math.abs(commande.originLat - commande.destinationLat) * 1.5 + 0.01,
        longitudeDelta: Math.abs(commande.originLng - commande.destinationLng) * 1.5 + 0.01,
      };
    }
    
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    return defaultRegion;
  };

  useEffect(() => {
    (async () => {
      try {
        // Demande la permission de localisation
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.warn("Erreur de localisation:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ... (conservez les autres fonctions existantes comme handleStatusUpdate, etc.)

  return (
    <View style={styles.container}>
      <Header title="Détails de la commande" showBackButton={true} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#44076a" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Section Carte - Toujours affichée */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={getMapRegion()}
              onMapReady={() => setMapReady(true)}
            >
              {/* Marqueur utilisateur si disponible */}
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Votre position"
                  pinColor="blue"
                />
              )}

              {/* Marqueur origine si disponible */}
              {hasValidOrigin && (
                <Marker
                  coordinate={{
                    latitude: commande.originLat,
                    longitude: commande.originLng
                  }}
                  title="Origine"
                  description={commande.origin}
                />
              )}

              {/* Marqueur destination si disponible */}
              {hasValidDestination && (
                <Marker
                  coordinate={{
                    latitude: commande.destinationLat,
                    longitude: commande.destinationLng
                  }}
                  title="Destination"
                  description={commande.destination}
                  pinColor="green"
                />
              )}
            </MapView>

            {/* Boutons de navigation conditionnels */}
            <View style={styles.mapButtons}>
              {hasValidOrigin && (
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => openMaps(commande.originLat, commande.originLng, "Origine")}
                >
                  <MaterialIcons name="directions" size={20} color="white" />
                  <Text style={styles.mapButtonText}>Aller à l'origine</Text>
                </TouchableOpacity>
              )}

              {hasValidDestination && (
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => openMaps(commande.destinationLat, commande.destinationLng, "Destination")}
                >
                  <MaterialIcons name="directions" size={20} color="white" />
                  <Text style={styles.mapButtonText}>Aller à destination</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Message d'information si coordonnées manquantes */}
          {!hasValidOrigin && !hasValidDestination && (
            <Text style={styles.warningText}>
              Les coordonnées précises ne sont pas disponibles
            </Text>
          )}

          {/* ... (conservez le reste de votre code existant pour les autres sections) ... */}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#44076a',
    borderRadius: 4,
    marginHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 12,
  },
  warningText: {
    textAlign: 'center',
    color: '#FF9800',
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 4,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    flexShrink: 1,
  },
  notesText: {
    color: '#666',
    lineHeight: 22,
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#44076a",
  },
  secondaryButton: {
    backgroundColor: "#877DAB",
  },
  orangeButton: {
    backgroundColor: "#FFA500",
  },
  tertiaryButton: {
    backgroundColor: "#5D8BF4",
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
});

export default CommandeDetailsScreen;