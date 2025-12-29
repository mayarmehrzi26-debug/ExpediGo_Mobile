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

const LOCATIONIQ_API_KEY = 'pk.4668eb1b56612fb3651519fb32f36efe';

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

  // Fonction de géocodage améliorée avec plusieurs stratégies
  const geocodeAddress = async (address: string): Promise<Coordinate> => {
    try {
      if (!address.trim()) {
        throw new Error('Adresse vide');
      }

      // Essai 1: Geocodage complet
      let response = await fetch(
        `https://api.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
      );

      // Essai 2: Si échec, simplifier l'adresse
      if (!response.ok) {
        const simplifiedAddress = address.split(',')[0];
        response = await fetch(
          `https://api.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(simplifiedAddress)}&format=json`
        );
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data[0]?.lat || !data[0]?.lon) {
        throw new Error('Coordonnées non trouvées');
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      throw new Error(`Impossible de localiser: ${address}`);
    }
  };

  // Tentative de géocodage avec réessais
  const geocodeWithRetry = async (address: string, retries = 3): Promise<Coordinate> => {
    try {
      return await geocodeAddress(address);
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return geocodeWithRetry(address, retries - 1);
      }
      throw error;
    }
  };

  // Itinéraire simplifié entre deux points
  const getSimpleRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  // Calcul de la région à afficher
  const calculateRegion = (coords: Coordinate[]) => {
    if (!coords || coords.length === 0) {
      return {
        latitude: 36.8,
        longitude: 10.2,
        latitudeDelta: 1,
        longitudeDelta: 1,
      };
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

        // Géocodage avec délai entre les requêtes
        const from = await geocodeWithRetry(fromAddress);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const to = await geocodeWithRetry(toAddress);

        setFromCoords(from);
        setToCoords(to);
        setCoordinates(getSimpleRoute(from, to));
      } catch (err) {
        console.error('Erreur initiale:', err);
        setError(err.message || 'Erreur de géocodage');
        
        // Essai de récupérer au moins une coordonnée
        try {
          const fromFallback = await geocodeWithRetry(fromAddress);
          setFromCoords(fromFallback);
        } catch (e) {
          console.log('Échec du géocodage de départ');
        }
        
        try {
          const toFallback = await geocodeWithRetry(toAddress);
          setToCoords(toFallback);
        } catch (e) {
          console.log('Échec du géocodage d\'arrivée');
        }
      } finally {
        setLoading(false);
      }
    };

    initGeocoding();
  }, [fromAddress, toAddress]);

  const handleOpenInMaps = () => {
    if (fromCoords && toCoords) {
      const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords.latitude},${fromCoords.longitude};${toCoords.latitude},${toCoords.longitude}`;
      Linking.openURL(url).catch(() => 
        Alert.alert('Erreur', 'Impossible d\'ouvrir la carte')
      );
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
        onMapReady={() => {
          const coords = [
            ...(fromCoords ? [fromCoords] : []),
            ...(toCoords ? [toCoords] : []),
            ...(livreurLocation ? [livreurLocation] : [])
          ];
          if (coords.length > 0) {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }}
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
          {fromCoords && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Départ:</Text>
              <Text style={styles.addressText}>{fromAddress}</Text>
            </View>
          )}
          
          {toCoords && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Destination:</Text>
              <Text style={styles.addressText}>{toAddress}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.mapButton}
          onPress={handleOpenInMaps}
        >
          <Icon name="map" size={20} color="#44076a" />
          <Text style={styles.mapButtonText}>Ouvrir dans OpenStreetMap</Text>
        </TouchableOpacity>
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
  },
  addressText: {
    color: '#666',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0ebf8',
    borderRadius: 5,
  },
  mapButtonText: {
    marginLeft: 10,
    color: '#44076a',
    fontWeight: '500',
  },
});

export default TrackingScreen;