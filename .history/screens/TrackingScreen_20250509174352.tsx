import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import Header from '../src/components/Header';

const { width, height } = Dimensions.get('window');

interface Coordinates {
  lat: number;
  lng: number;
}

const TrackingScreen = ({ route }) => {
  const { fromAddress, toAddress, deliveryId } = route.params;
  const [fromCoords, setFromCoords] = useState<Coordinates | null>(null);
  const [toCoords, setToCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction de géocodage gratuite avec Nominatim
  const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const from = await geocodeAddress(fromAddress);
        const to = await geocodeAddress(toAddress);

        if (!from || !to) {
          throw new Error('Impossible de localiser les adresses');
        }

        setFromCoords(from);
        setToCoords(to);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

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
          <Text 
            style={styles.openBrowserText}
            onPress={() => Linking.openURL(`https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords?.lat}%2C${fromCoords?.lng}%3B${toCoords?.lat}%2C${toCoords?.lng}`)}
          >
            Ouvrir dans le navigateur
          </Text>
        </View>
      </View>
    );
  }

  // HTML pour la carte Leaflet (OpenStreetMap)
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body { margin:0; padding:0; }
          #map { width:100%; height:100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([${(fromCoords.lat + toCoords.lat) / 2}, ${(fromCoords.lng + toCoords.lng) / 2}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);
          
          // Marqueur de départ
          L.marker([${fromCoords.lat}, ${fromCoords.lng}])
            .addTo(map)
            .bindPopup("Point de départ");
          
          // Marqueur d'arrivée
          L.marker([${toCoords.lat}, ${toCoords.lng}])
            .addTo(map)
            .bindPopup("Point d'arrivée");
          
          // Ligne entre les points
          L.polyline(
            [[${fromCoords.lat}, ${fromCoords.lng}], [${toCoords.lat}, ${toCoords.lng}]],
            { color: '#44076a', weight: 4 }
          ).addTo(map);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Header title="Suivi de livraison" showBackButton={true} />
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={[styles.markerColor, { backgroundColor: '#44076a' }]} />
          <Text style={styles.infoText}>Départ: {fromAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.markerColor, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.infoText}>Arrivée: {toAddress}</Text>
        </View>
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
    height: '80%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 15,
    color: '#44076a',
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
  },
  bold: {
    fontWeight: 'bold',
  },
  openBrowserText: {
    color: '#44076a',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  markerColor: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
  },
});

export default TrackingScreen;