import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import Header from '../../src/components/Header';
import {
  Coordinates,
  getAddressCoordinates,
  getFallbackCoordinates
} from '../src/services/GeocodingService';

const { width } = Dimensions.get('window');

interface TrackingScreenProps {
  route: {
    params: {
      deliveryId: string;
      fromAddress: string;
      toAddress: string;
    }
  };
}

const TrackingScreen: React.FC<TrackingScreenProps> = ({ route }) => {
  const { fromAddress, toAddress, deliveryId } = route.params;
  const [fromCoords, setFromCoords] = useState<Coordinates | null>(null);
  const [toCoords, setToCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Premier essai avec Nominatim
        let from = await getAddressCoordinates(fromAddress);
        await new Promise(resolve => setTimeout(resolve, 1100)); // Respecter la limite de 1 req/sec
        let to = await getAddressCoordinates(toAddress);

        // Si échec, utiliser le fallback
        if (!from || !to) {
          from = await getFallbackCoordinates(fromAddress);
          to = await getFallbackCoordinates(toAddress);
        }

        if (!from || !to) {
          throw new Error('Impossible de localiser les adresses');
        }

        setFromCoords(from);
        setToCoords(to);
      } catch (err) {
        console.error('Full error:', err);
        setError(err.message || 'Erreur de géocodage');
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [fromAddress, toAddress]);

  const renderMap = () => {
    if (!fromCoords || !toCoords) return null;

    const centerLat = (fromCoords.latitude + toCoords.latitude) / 2;
    const centerLng = (fromCoords.longitude + toCoords.longitude) / 2;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <style>
            body { margin:0; padding:0; }
            #map { width:100%; height:100%; }
            .custom-icon {
              background: none;
              border: none;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <script>
            const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            
            // Icône personnalisée pour le départ
            const startIcon = L.divIcon({
              html: '<i class="fas fa-map-marker-alt" style="color: #44076a; font-size: 24px;"></i>',
              className: 'custom-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 24]
            });
            
            // Icône personnalisée pour l'arrivée
            const endIcon = L.divIcon({
              html: '<i class="fas fa-flag" style="color: #ff6b6b; font-size: 24px;"></i>',
              className: 'custom-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 24]
            });
            
            L.marker([${fromCoords.latitude}, ${fromCoords.longitude}], { icon: startIcon })
              .addTo(map)
              .bindPopup("Point de départ");
            
            L.marker([${toCoords.latitude}, ${toCoords.longitude}], { icon: endIcon })
              .addTo(map)
              .bindPopup("Point d'arrivée");
            
            L.polyline(
              [[${fromCoords.latitude}, ${fromCoords.longitude}], [${toCoords.latitude}, ${toCoords.longitude}]],
              { color: '#44076a', weight: 4, dashArray: '5, 5' }
            ).addTo(map);
          </script>
        </body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#44076a" />
          </View>
        )}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Suivi de livraison" showBackButton={true} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      </View>
    );
  }

  if (error || !fromCoords || !toCoords) {
    return (
      <View style={styles.container}>
        <Header title="Suivi de livraison" showBackButton={true} />
        <View style={styles.center}>
          <Icon name="alert-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Erreur de localisation'}</Text>
          <Text style={styles.addressText}>
            <Text style={styles.bold}>Départ:</Text> {fromAddress}
          </Text>
          <Text style={styles.addressText}>
            <Text style={styles.bold}>Arrivée:</Text> {toAddress}
          </Text>
          
          <TouchableOpacity
            style={styles.openBrowserButton}
            onPress={() => Linking.openURL(
              `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords?.latitude}%2C${fromCoords?.longitude}%3B${toCoords?.latitude}%2C${toCoords?.longitude}`
            )}
          >
            <Text style={styles.openBrowserText}>
              <Icon name="open-in-new" size={16} color="#44076a" /> Ouvrir dans le navigateur
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Suivi de livraison" showBackButton={true} />
      {renderMap()}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#44076a" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {fromAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="flag" size={20} color="#ff6b6b" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {toAddress}
          </Text>
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
  map: {
    width: '100%',
    height: '70%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  loadingText: {
    marginTop: 15,
    color: '#44076a',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 14,
    marginVertical: 5,
    textAlign: 'center',
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  openBrowserButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F0EBF8',
  },
  openBrowserText: {
    color: '#44076a',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  deliveryId: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TrackingScreen;