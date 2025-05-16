import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface TrackingScreenProps {
  route: any;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

const TrackingScreen: React.FC<TrackingScreenProps> = () => {
  const route = useRoute();
  const { fromAddress, toAddress, deliveryId } = route.params;
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [fromCoords, setFromCoords] = useState<Coordinate | null>(null);
  const [toCoords, setToCoords] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour géocoder une adresse avec Nominatim (OpenStreetMap)
  const geocodeAddress = async (address: string): Promise<Coordinate> => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      
      if (response.data.length === 0) {
        throw new Error('Adresse non trouvée');
      }

      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
      };
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      throw err;
    }
  };

  // Fonction pour obtenir l'itinéraire avec OSRM (Open Source Routing Machine)
  const fetchRoute = async (start: Coordinate, end: Coordinate) => {
    try {
      const response = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );

      if (response.data.routes.length === 0) {
        throw new Error('Aucun itinéraire trouvé');
      }

      const routeCoordinates = response.data.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
        longitude: coord[0],
        latitude: coord[1],
      }));

      setCoordinates(routeCoordinates);
    } catch (err) {
      console.error('Erreur de calcul d\'itinéraire:', err);
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Demander la permission de localisation
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission de localisation refusée');
          setLoading(false);
          return;
        }

        // Obtenir la position actuelle
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Géocoder les adresses
        const from = await geocodeAddress(fromAddress);
        const to = await geocodeAddress(toAddress);
        setFromCoords(from);
        setToCoords(to);

        // Obtenir l'itinéraire
        await fetchRoute(from, to);
      } catch (err) {
        setError('Impossible de charger les données de la carte');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fromAddress, toAddress]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" />
        <Text>Chargement de la carte...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!fromCoords || !toCoords) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de localiser les adresses</Text>
      </View>
    );
  }

  // Calculer la région à afficher sur la carte
  const initialRegion = {
    latitude: (fromCoords.latitude + toCoords.latitude) / 2,
    longitude: (fromCoords.longitude + toCoords.longitude) / 2,
    latitudeDelta: Math.abs(fromCoords.latitude - toCoords.latitude) * 1.5 + 0.1,
    longitudeDelta: Math.abs(fromCoords.longitude - toCoords.longitude) * 1.5 + 0.1,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Suivi de livraison #{deliveryId.substring(0, 6)}</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {/* Marqueur pour le point de départ */}
        <Marker
          coordinate={fromCoords}
          title="Point de départ"
          description={fromAddress}
        >
          <View style={styles.markerStart}>
            <Text style={styles.markerText}>Départ</Text>
          </View>
        </Marker>

        {/* Marqueur pour le point d'arrivée */}
        <Marker
          coordinate={toCoords}
          title="Point d'arrivée"
          description={toAddress}
        >
          <View style={styles.markerEnd}>
            <Text style={styles.markerText}>Arrivée</Text>
          </View>
        </Marker>

        {/* Ligne de l'itinéraire */}
        <Polyline
          coordinates={coordinates}
          strokeWidth={4}
          strokeColor="#44076a"
        />
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>De: {fromAddress}</Text>
        <Text style={styles.footerText}>À: {toAddress}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  header: {
    width: '100%',
    padding: 15,
    backgroundColor: '#44076a',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    flex: 1,
  },
  footer: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 14,
    marginVertical: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  markerStart: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
  },
  markerEnd: {
    backgroundColor: '#F44336',
    padding: 5,
    borderRadius: 5,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default TrackingScreen;