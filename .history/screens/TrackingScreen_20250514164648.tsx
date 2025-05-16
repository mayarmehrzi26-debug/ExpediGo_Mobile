import { useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LivraisonModel } from '../src/livraison/models/LivraisonModel';

const { width, height } = Dimensions.get('window');

interface Coordinate {
  latitude: number;
  longitude: number;
}

const LOCATIONIQ_API_KEY = 'pk.17568ced89faf24c4ee34b7efef1d10a'; // À remplacer par votre clé

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
  const model = new LivraisonModel();

  // Géocodage avec LocationIQ
  const geocodeWithLocationIQ = async (address: string): Promise<Coordinate> => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data[0]?.lat || !data[0]?.lon) {
        throw new Error('Adresse non trouvée');
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('Erreur LocationIQ:', err);
      throw new Error('Service de géocodage indisponible');
    }
  };

  // Obtenir un itinéraire simplifié (ligne droite)
  const getSimpleRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  const calculateRegion = (coordinates: Coordinate[]) => {
    if (!coordinates || coordinates.length === 0) return null;
  
    const lats = coordinates.map(coord => coord.latitude);
    const lngs = coordinates.map(coord => coord.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
  
    const padding = 0.2; // Padding supplémentaire autour du trajet
  
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) + padding,
      longitudeDelta: Math.abs(maxLng - minLng) + padding,
    };
  };

  // Écouter la position du livreur en temps réel
  useEffect(() => {
    if (!livreurId) return;

    const unsubscribe = model.listenToLivreurPosition(
      livreurId,
      (position) => {
        if (position) {
          setLivreurLocation({
            latitude: position.latitude,
            longitude: position.longitude
          });
          
          // Recentrer la carte si nécessaire
          if (mapRef.current && fromCoords && toCoords) {
            const allCoordinates = [
              fromCoords, 
              toCoords, 
              { latitude: position.latitude, longitude: position.longitude }
            ];
            mapRef.current.fitToCoordinates(allCoordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }
      }
    );

    return () => unsubscribe();
  }, [livreurId, fromCoords, toCoords]);

  useEffect(() => {
    const init = async () => {
      try {
        // Géocodage des deux adresses avec délai pour éviter les limites de taux
        const from = await geocodeWithLocationIQ(fromAddress);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
        const to = await geocodeWithLocationIQ(toAddress);

        setFromCoords(from);
        setToCoords(to);
        setCoordinates(getSimpleRoute(from, to));
      } catch (err) {
        setError(err.message || 'Erreur de localisation');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fromAddress, toAddress]);

  const handleOpenInBrowser = () => {
    if (fromCoords && toCoords) {
      Linking.openURL(
        `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords.latitude},${fromCoords.longitude};${toCoords.latitude},${toCoords.longitude}`
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
            onPress={handleOpenInBrowser}
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
          if (fromCoords && toCoords) {
            const coordsToFit = livreurLocation 
              ? [fromCoords, toCoords, livreurLocation]
              : [fromCoords, toCoords];
            
            mapRef.current?.fitToCoordinates(coordsToFit, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }}
      >
        <Marker coordinate={fromCoords}>
          <View style={styles.marker}>
            <Icon name="map-marker" size={30} color="#44076a" />
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
              <Icon name="truck-delivery" size={30} color="#EA4335" />
              <Text style={styles.markerText}>Livreur</Text>
            </View>
          </Marker>
        )}

        <Polyline
          coordinates={coordinates}
          strokeWidth={3}
          strokeColor="#44076a"
          lineDashPattern={[5, 5]}
        />

        {/* Trajet du livreur vers la destination */}
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
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default TrackingScreen;