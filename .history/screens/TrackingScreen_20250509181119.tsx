import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Coordinate {
  latitude: number;
  longitude: number;
}

const TrackingScreen = () => {
  const route = useRoute();
  const { fromAddress, toAddress, deliveryId } = route.params;
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [fromCoords, setFromCoords] = useState<Coordinate | null>(null);
  const [toCoords, setToCoords] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nouvelle fonction de géocodage plus robuste
  const geocodeAddress = async (address: string): Promise<Coordinate> => {
    try {
      // Solution 1: Utilisation de MapQuest (gratuit avec clé)
      const mapquestResponse = await fetch(
        `https://www.mapquestapi.com/geocoding/v1/address?key=YOUR_MAPQUEST_KEY&location=${encodeURIComponent(address)}`
      );
      
      const mapquestData = await mapquestResponse.json();
      if (mapquestData?.results?.[0]?.locations?.[0]?.latLng) {
        return {
          latitude: mapquestData.results[0].locations[0].latLng.lat,
          longitude: mapquestData.results[0].locations[0].latLng.lng,
        };
      }

      // Solution 2: Fallback avec Nominatim (avec headers appropriés)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
            'Accept-Language': 'fr',
          }
        }
      );
      
      const nominatimData = await nominatimResponse.json();
      if (nominatimData.length === 0) {
        throw new Error('Adresse non trouvée');
      }

      return {
        latitude: parseFloat(nominatimData[0].lat),
        longitude: parseFloat(nominatimData[0].lon),
      };
    } catch (err) {
      console.error('Erreur de géocodage:', err);
      throw err;
    }
  };

  // Fonction pour obtenir l'itinéraire (version simplifiée)
  const getSimpleRoute = (start: Coordinate, end: Coordinate) => {
    // Pour une vraie application, vous devriez pré-calculer les routes
    // ou utiliser un service comme OSRM localement
    return [start, end];
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Géocoder les adresses avec délai entre les requêtes
        const from = await geocodeAddress(fromAddress);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Respecter les limites de taux
        const to = await geocodeAddress(toAddress);
        
        setFromCoords(from);
        setToCoords(to);
        setCoordinates(getSimpleRoute(from, to));
      } catch (err) {
        setError('Impossible de localiser les adresses. Vérifiez votre connexion internet.');
        console.error(err);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Suivi de livraison #{deliveryId.substring(0, 6)}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text>Chargement de la carte...</Text>
        </View>
      </View>
    );
  }

  if (error || !fromCoords || !toCoords) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Suivi de livraison #{deliveryId.substring(0, 6)}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Erreur de localisation'}</Text>
          <Text style={styles.addressText}>Départ: {fromAddress}</Text>
          <Text style={styles.addressText}>Arrivée: {toAddress}</Text>
          
          <TouchableOpacity 
            style={styles.browserButton}
            onPress={handleOpenInBrowser}
          >
            <Text style={styles.browserButtonText}>
              <Icon name="open-in-new" size={16} /> Ouvrir dans le navigateur
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Suivi de livraison #{deliveryId.substring(0, 6)}</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (fromCoords.latitude + toCoords.latitude) / 2,
          longitude: (fromCoords.longitude + toCoords.longitude) / 2,
          latitudeDelta: Math.abs(fromCoords.latitude - toCoords.latitude) * 2 + 0.1,
          longitudeDelta: Math.abs(fromCoords.longitude - toCoords.longitude) * 2 + 0.1,
        }}
      >
        <Marker coordinate={fromCoords}>
          <View style={styles.markerStart}>
            <Icon name="map-marker" size={30} color="#44076a" />
          </View>
        </Marker>

        <Marker coordinate={toCoords}>
          <View style={styles.markerEnd}>
            <Icon name="flag" size={30} color="#ff6b6b" />
          </View>
        </Marker>

        <Polyline
          coordinates={coordinates}
          strokeWidth={4}
          strokeColor="#44076a"
        />
      </MapView>

      <View style={styles.footer}>
        <View style={styles.addressRow}>
          <Icon name="map-marker" size={20} color="#44076a" />
          <Text style={styles.footerText}>{fromAddress}</Text>
        </View>
        <View style={styles.addressRow}>
          <Icon name="flag" size={20} color="#ff6b6b" />
          <Text style={styles.footerText}>{toAddress}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 14,
    marginVertical: 5,
    textAlign: 'center',
  },
  browserButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#44076a',
    borderRadius: 5,
  },
  browserButtonText: {
    color: 'white',
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 10,
  },
  markerStart: {
    alignItems: 'center',
  },
  markerEnd: {
    alignItems: 'center',
  },
});

export default TrackingScreen;