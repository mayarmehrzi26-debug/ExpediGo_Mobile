import MapboxGL from '@react-native-mapbox-gl/maps';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../NavigationTypes';
import Header from '../../src/components/Header';
import { getAddressCoordinates } from '../../src/services/GeocodingService';

// Configuration de Mapbox (vous devez créer un compte gratuit sur Mapbox)
MapboxGL.setAccessToken('your-mapbox-access-token'); // Remplacez par votre token

type TrackingScreenRouteProp = RouteProp<RootStackParamList, 'TrackingScreen'>;

interface TrackingScreenProps {
  route: TrackingScreenRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'TrackingScreen'>;
}

const TrackingScreen: React.FC<TrackingScreenProps> = ({ route }) => {
  const { deliveryId, fromAddress, toAddress } = route.params;
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{
    from: [number, number] | null;
    to: [number, number] | null;
  }>({ from: null, to: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        setLoading(true);
        
        // Géocodage des adresses (conversion adresse -> coordonnées GPS)
        const fromCoords = await getAddressCoordinates(fromAddress);
        const toCoords = await getAddressCoordinates(toAddress);
        
        if (!fromCoords || !toCoords) {
          throw new Error('Impossible de localiser les adresses');
        }
        
        setCoordinates({
          from: [fromCoords.longitude, fromCoords.latitude],
          to: [toCoords.longitude, toCoords.latitude]
        });
      } catch (err) {
        console.error('Erreur de géocodage:', err);
        setError('Impossible de charger la carte. Vérifiez votre connexion internet.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [fromAddress, toAddress]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Itinéraire de livraison" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Itinéraire de livraison" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.addressText}>
            <Text style={styles.bold}>Départ:</Text> {fromAddress}
          </Text>
          <Text style={styles.addressText}>
            <Text style={styles.bold}>Arrivée:</Text> {toAddress}
          </Text>
        </View>
      </View>
    );
  }

  if (!coordinates.from || !coordinates.to) {
    return (
      <View style={styles.container}>
        <Header title="Itinéraire de livraison" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Données de localisation manquantes</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Itinéraire de livraison" showBackButton={true} />
      
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v11" // Style de carte gratuit
        >
          <MapboxGL.Camera
            zoomLevel={12}
            centerCoordinate={coordinates.from}
            animationMode="flyTo"
            animationDuration={2000}
          />
          
          {/* Marqueur de départ */}
          <MapboxGL.PointAnnotation
            id="startPoint"
            coordinate={coordinates.from}
          >
            <View style={styles.marker}>
              <Icon name="map-marker" size={30} color="#44076a" />
            </View>
          </MapboxGL.PointAnnotation>
          
          {/* Marqueur d'arrivée */}
          <MapboxGL.PointAnnotation
            id="endPoint"
            coordinate={coordinates.to}
          >
            <View style={styles.marker}>
              <Icon name="flag" size={30} color="#ff6b6b" />
            </View>
          </MapboxGL.PointAnnotation>
          
          {/* Ligne entre les points */}
          <MapboxGL.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [coordinates.from, coordinates.to],
              },
              properties: {},
            }}
          >
            <MapboxGL.LineLayer
              id="routeLine"
              style={{
                lineColor: '#44076a',
                lineWidth: 4,
                lineOpacity: 0.7,
              }}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={[styles.colorIndicator, { backgroundColor: '#44076a' }]} />
          <Text style={styles.infoText}>Point de départ: {fromAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.colorIndicator, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.infoText}>Point d'arrivée: {toAddress}</Text>
        </View>
        <Text style={styles.deliveryId}>Livraison #{deliveryId.substring(0, 8)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  deliveryId: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadindText: {
    marginTop: 16,
    color: '#44076a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 20,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default TrackingScreen;