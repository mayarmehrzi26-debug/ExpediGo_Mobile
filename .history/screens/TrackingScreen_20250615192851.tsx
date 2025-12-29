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

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

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

  // Nouvelle fonction de géocodage avec Nominatim (OpenStreetMap)
  const geocodeWithNominatim = async (address: string): Promise<Coordinate> => {
    try {
      const response = await fetch(
        `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0 || !data[0].lat || !data[0].lon) {
        throw new Error('Adresse non trouvée');
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('Erreur Nominatim:', err);
      throw new Error(`Impossible de localiser l'adresse: ${err.message}`);
    }
  };

  // Fonction avec réessai et délai
  const geocodeWithRetry = async (address: string, retries = 3): Promise<Coordinate> => {
    try {
      // Essayer d'abord avec Nominatim
      return await geocodeWithNominatim(address);
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return geocodeWithRetry(address, retries - 1);
      }
      throw error;
    }
  };

  // Obtenir un itinéraire simplifié
  const getSimpleRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  // Calculer la région à afficher
  const calculateRegion = (coordinates: Coordinate[]) => {
    if (!coordinates || coordinates.length === 0) return null;

    const lats = coordinates.map(coord => coord.latitude);
    const lngs = coordinates.map(coord => coord.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padding = 0.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) + padding,
      longitudeDelta: Math.abs(maxLng - minLng) + padding,
    };
  };

  // Suivre la position du livreur
  useEffect(() => {
    if (!livreurId || !deliveryId) return;

    const unsubscribe = onSnapshot(doc(firebasestore, "livreurLocations", livreurId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        if (data.commandeId === deliveryId && 
            (data.status === "En cours de pickup" || data.status === "En cours de livraison")) {
          const newLocation = {
            latitude: data.latitude,
            longitude: data.longitude
          };
          setLivreurLocation(newLocation);
          
          if (mapRef.current && fromCoords && toCoords) {
            mapRef.current.fitToCoordinates([fromCoords, toCoords, newLocation], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [livreurId, deliveryId, fromCoords, toCoords]);

  // Initialisation
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const from = await geocodeWithRetry(fromAddress);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const to = await geocodeWithRetry(toAddress);

        setFromCoords(from);
        setToCoords(to);
        setCoordinates(getSimpleRoute(from, to));
      } catch (err) {
        console.error('Erreur initiale:', err);
        setError(err.message || 'Erreur de géocodage');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fromAddress, toAddress]);

  const handleOpenInMaps = () => {
    if (fromCoords && toCoords) {
      const url = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords.latitude},${fromCoords.longitude};${toCoords.latitude},${toCoords.longitude}`;
      Linking.openURL(url).catch(() => 
        Alert.alert('Erreur', 'Impossible d\'ouvrir la carte')
      );
    }
  };


  const routeRegion = calculateRegion(
    fromCoords && toCoords ? [fromCoords, toCoords] : []
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Livraison #{deliveryId.substring(0, 6)}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
        </View>
      </View>
    );
  }

  if (error || !fromCoords || !toCoords) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Livraison #{deliveryId.substring(0, 6)}</Text>
        </View>
        <View style={styles.center}>
          <Icon name="alert-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Erreur de géocodage'}</Text>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Départ:</Text>
            <Text style={styles.address}>{fromAddress}</Text>
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Arrivée:</Text>
            <Text style={styles.address}>{toAddress}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.browserButton}
            onPress={handleOpenInMaps}
          >
            <Text style={styles.browserButtonText}>
              <Icon name="map" size={16} /> Voir sur OpenStreetMap
            </Text>
          </TouchableOpacity>
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
        region={routeRegion}
        onMapReady={() => {
          const coordsToFit = livreurLocation 
            ? [fromCoords, toCoords, livreurLocation]
            : [fromCoords, toCoords];
          
          mapRef.current?.fitToCoordinates(coordsToFit, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }}
      >
        <Marker coordinate={fromCoords}>
          <View style={styles.marker}>
            <Icon name="map-marker" size={30} color="#ff6b6b" />
            <Text style={styles.markerText}>Départ</Text>
          </View>
        </Marker>

        <Marker coordinate={toCoords}>
          <View style={styles.marker}>
            <Icon name="flag" size={30} color="#ff6b6b" />
            <Text style={styles.markerText}>Destination</Text>
          </View>
        </Marker>

        {livreurLocation && (
          <Marker coordinate={livreurLocation}>
            <View style={styles.livreurMarker}>
              <Icon name="truck-delivery" size={30} color="#44076a" />
            </View>
          </Marker>
        )}

        <Polyline
          coordinates={coordinates}
          strokeWidth={3}
          strokeColor="#44076a"
          lineDashPattern={[5, 5]}
        />

        {livreurLocation && toCoords && (
          <Polyline
            coordinates={[livreurLocation, toCoords]}
            strokeWidth={2}
            strokeColor="#EA4335"
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Icon name="information" size={20} color="#44076a" />
          <Text style={styles.infoText}>
            {livreurLocation 
              ? "Position du livreur en temps réel" 
              : "Trace approximative - ligne droite"}
          </Text>
        </View>
        
        {livreurLocation && (
          <View style={styles.positionInfo}>
            <Text style={styles.positionText}>
              Latitude: {livreurLocation.latitude.toFixed(5)}
            </Text>
            <Text style={styles.positionText}>
              Longitude: {livreurLocation.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            if (mapRef.current && fromCoords && toCoords) {
              const coordsToFit = livreurLocation 
                ? [fromCoords, toCoords, livreurLocation]
                : [fromCoords, toCoords];
              
              mapRef.current.fitToCoordinates(coordsToFit, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          }}
        >
          <Icon name="refresh" size={20} color="#44076a" />
          <Text style={styles.refreshButtonText}>Recentrer la carte</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  addressBox: {
    marginVertical: 10,
    width: '100%',
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  address: {
    color: '#666',
  },
  browserButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#44076a',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browserButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  map: {
    width: '100%',
    height: height * 0.7,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  livreurMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#44076a',
  },
  markerText: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 12,
  },
  positionInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  positionText: {
    fontSize: 12,
    color: '#333',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0ebf8',
    borderRadius: 5,
  },
  refreshButtonText: {
    marginLeft: 5,
    color: '#44076a',
    fontWeight: '500',
  },
});

export default TrackingScreen;