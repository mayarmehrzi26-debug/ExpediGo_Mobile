import { useRoute } from '@react-navigation/native';
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from "../FirebaseConfig";

const { width, height } = Dimensions.get('window');

interface Coordinate {
  latitude: number;
  longitude: number;
}

// Configuration du géocodage
const GEOCODING_CONFIG = {
  API_KEY: 'pk.4668eb1b56612fb3651519fb32f36efe',
  BASE_URL: 'https://api.locationiq.com/v1',
  RATE_LIMIT_DELAY: 1100, // 1.1s entre les requêtes
  MAX_RETRIES: 3,
  DEFAULT_REGION: {
    latitude: 36.8, // Centre de la Tunisie
    longitude: 10.2,
    latitudeDelta: 1,
    longitudeDelta: 1,
  }
};

const TrackingScreen = () => {
  const route = useRoute();
  const { fromAddress, toAddress, deliveryId, livreurId } = route.params;
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [fromCoords, setFromCoords] = useState<Coordinate | null>(null);
  const [toCoords, setToCoords] = useState<Coordinate | null>(null);
  const [livreurLocation, setLivreurLocation] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Cache pour les résultats de géocodage
  const geocodeCache = useRef(new Map<string, Coordinate>()).current;

  // Fonction de nettoyage des adresses
  const cleanAddress = (address: string): string => {
    return address
      .replace(/PHGV\+\w+/i, '') // Supprime les codes PHGV
      .replace(/\s+/g, ' ') // Supprime les espaces multiples
      .trim();
  };

  // Fonction de géocodage avec gestion d'erreur complète
  const geocodeAddress = async (address: string): Promise<Coordinate> => {
    const cleanedAddress = cleanAddress(address);
    
    // Vérifier le cache d'abord
    if (geocodeCache.has(cleanedAddress)) {
      return geocodeCache.get(cleanedAddress)!;
    }

    try {
      // Essai avec l'adresse complète
      let response = await fetch(
        `${GEOCODING_CONFIG.BASE_URL}/search.php?key=${GEOCODING_CONFIG.API_KEY}&q=${encodeURIComponent(cleanedAddress)}&format=json`
      );

      // Si échec, essayer avec une version simplifiée
      if (!response.ok) {
        const simplifiedAddress = cleanedAddress.split(',')[0];
        response = await fetch(
          `${GEOCODING_CONFIG.BASE_URL}/search.php?key=${GEOCODING_CONFIG.API_KEY}&q=${encodeURIComponent(simplifiedAddress)}&format=json`
        );
      }

      // Gestion des erreurs HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erreur HTTP: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data[0]?.lat || !data[0]?.lon) {
        throw new Error('Aucune coordonnée trouvée pour cette adresse');
      }

      const coords = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };

      // Mise en cache
      geocodeCache.set(cleanedAddress, coords);
      
      return coords;
    } catch (err) {
      console.error(`Échec du géocodage pour: ${cleanedAddress}`, err);
      throw new Error(`Impossible de localiser: ${cleanedAddress}`);
    }
  };

  // Géocodage avec système de réessai
  const geocodeWithRetry = async (address: string, retries = GEOCODING_CONFIG.MAX_RETRIES): Promise<Coordinate> => {
    try {
      // Délai entre les tentatives
      if (retries < GEOCODING_CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, GEOCODING_CONFIG.RATE_LIMIT_DELAY));
      }
      
      return await geocodeAddress(address);
    } catch (error) {
      if (retries > 0) {
        return geocodeWithRetry(address, retries - 1);
      }
      throw error;
    }
  };

  // Itinéraire simplifié entre deux points
  const getSimpleRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  // Calcul de la région à afficher sur la carte
  const calculateRegion = (coords: Coordinate[]) => {
    if (!coords || coords.length === 0) {
      return GEOCODING_CONFIG.DEFAULT_REGION;
    }

    const lats = coords.map(c => c.latitude);
    const lngs = coords.map(c => c.longitude);
    
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: Math.abs(Math.max(...lats) - Math.min(...lats)) * 1.5,
      longitudeDelta: Math.abs(Math.max(...lngs) - Math.min(...lngs)) * 1.5,
    };
  };

  // Suivi du livreur en temps réel
  useEffect(() => {
    if (!livreurId || !deliveryId) return;

    const unsubscribe = onSnapshot(doc(firebasestore, "livreurLocations", livreurId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.commandeId === deliveryId) {
          setLivreurLocation({
            latitude: data.latitude,
            longitude: data.longitude
          });
        }
      }
    });

    return () => unsubscribe();
  }, [livreurId, deliveryId]);

  // Initialisation du géocodage
  useEffect(() => {
    const initGeocoding = async () => {
      try {
        setLoading(true);
        setError(null);

        // Géocodage avec gestion des erreurs individuelles
        const results = await Promise.allSettled([
          geocodeWithRetry(fromAddress),
          new Promise(resolve => setTimeout(resolve, GEOCODING_CONFIG.RATE_LIMIT_DELAY))
            .then(() => geocodeWithRetry(toAddress))
        ]);

        const [fromResult, toResult] = results;

        // Traitement des résultats
        if (fromResult.status === 'fulfilled') {
          setFromCoords(fromResult.value);
        } else {
          console.error('Échec du géocodage de départ:', fromResult.reason);
        }

        if (toResult.status === 'fulfilled') {
          setToCoords(toResult.value);
        } else {
          console.error('Échec du géocodage d\'arrivée:', toResult.reason);
        }

        // Définir l'itinéraire si les deux adresses sont trouvées
        if (fromResult.status === 'fulfilled' && toResult.status === 'fulfilled') {
          setCoordinates(getSimpleRoute(fromResult.value, toResult.value));
        } else {
          // Créer un message d'erreur combiné si nécessaire
          const errors = [
            fromResult.status === 'rejected' ? fromResult.reason.message : null,
            toResult.status === 'rejected' ? toResult.reason.message : null
          ].filter(Boolean);

          if (errors.length > 0) {
            setError(errors.join('\n'));
          }
        }
      } catch (err) {
        console.error('Erreur lors du géocodage:', err);
        setError(err.message || 'Erreur de géocodage');
      } finally {
        setLoading(false);
      }
    };

    initGeocoding();
  }, [fromAddress, toAddress]);

  // Ouvrir dans l'application de cartographie
  const handleOpenInMaps = () => {
    if (fromCoords && toCoords) {
      const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords.latitude},${fromCoords.longitude};${toCoords.latitude},${toCoords.longitude}`;
      Linking.openURL(url).catch(() => 
        Alert.alert('Erreur', 'Impossible d\'ouvrir la carte')
      );
    } else {
      // Fallback si les coordonnées ne sont pas disponibles
      const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(fromAddress)}%20to%20${encodeURIComponent(toAddress)}`;
      Linking.openURL(url).catch(() => 
        Alert.alert('Erreur', 'Impossible d\'ouvrir la carte')
      );
    }
  };

  // Recentrer la carte
  const handleRecenter = () => {
    const coords = [
      ...(fromCoords ? [fromCoords] : []),
      ...(toCoords ? [toCoords] : []),
      ...(livreurLocation ? [livreurLocation] : [])
    ];
    
    if (coords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Livraison #{deliveryId.substring(0, 6)}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Livraison #{deliveryId.substring(0, 6)}</Text>
      </View>

      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={calculateRegion([
          ...(fromCoords ? [fromCoords] : []),
          ...(toCoords ? [toCoords] : []),
          ...(livreurLocation ? [livreurLocation] : [])
        ])}
        onMapReady={handleRecenter}
      >
        {fromCoords && (
          <Marker coordinate={fromCoords}>
            <View style={styles.marker}>
              <Icon name="map-marker" size={30} color="#ff6b6b" />
              <Text style={styles.markerText}>Départ</Text>
            </View>
          </Marker>
        )}

        {toCoords && (
          <Marker coordinate={toCoords}>
            <View style={styles.marker}>
              <Icon name="flag" size={30} color="#ff6b6b" />
              <Text style={styles.markerText}>Destination</Text>
            </View>
          </Marker>
        )}

        {livreurLocation && (
          <Marker coordinate={livreurLocation}>
            <View style={styles.livreurMarker}>
              <Icon name="truck-delivery" size={30} color="#44076a" />
              <Text style={styles.markerText}>Livreur</Text>
            </View>
          </Marker>
        )}

        {fromCoords && toCoords && (
          <Polyline
            coordinates={[fromCoords, toCoords]}
            strokeWidth={3}
            strokeColor="#44076a"
          />
        )}

        {livreurLocation && toCoords && (
          <Polyline
            coordinates={[livreurLocation, toCoords]}
            strokeWidth={2}
            strokeColor="#EA4335"
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={24} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.addressContainer}>
          {fromAddress && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Départ:</Text>
              <Text style={styles.addressText}>{cleanAddress(fromAddress)}</Text>
              {fromCoords && (
                <Text style={styles.coordsText}>
                  {fromCoords.latitude.toFixed(5)}, {fromCoords.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          )}
          
          {toAddress && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Destination:</Text>
              <Text style={styles.addressText}>{cleanAddress(toAddress)}</Text>
              {toCoords && (
                <Text style={styles.coordsText}>
                  {toCoords.latitude.toFixed(5)}, {toCoords.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleOpenInMaps}
          >
            <Icon name="map" size={20} color="white" />
            <Text style={styles.buttonText}>Ouvrir la carte</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleRecenter}
          >
            <Icon name="crosshairs-gps" size={20} color="#44076a" />
            <Text style={[styles.buttonText, { color: '#44076a' }]}>Recenter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#44076a',
    padding: 15,
    paddingTop: 30,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  map: {
    width: '100%',
    height: height * 0.6,
  },
  marker: {
    alignItems: 'center',
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  livreurMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#44076a',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ffdddd',
  },
  errorText: {
    marginLeft: 10,
    color: '#ff6b6b',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressContainer: {
    marginBottom: 15,
  },
  addressBox: {
    marginBottom: 10,
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#44076a',
    fontSize: 14,
  },
  addressText: {
    color: '#666',
    fontSize: 14,
  },
  coordsText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#44076a',
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: '#f0ebf8',
  },
  buttonText: {
    marginLeft: 10,
    color: 'white',
    fontWeight: '500',
  },
});

export default TrackingScreen;