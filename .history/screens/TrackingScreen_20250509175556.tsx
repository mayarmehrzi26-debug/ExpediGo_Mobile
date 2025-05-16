import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../src/components/Header';
import { getLocalAddressCoordinates } from '../../src/services/GeocodingService';

const { width } = Dimensions.get('window');

const TrackingScreen = ({ route }) => {
  const { fromAddress, toAddress, deliveryId } = route.params;
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = () => {
      try {
        const from = getLocalAddressCoordinates(fromAddress);
        const to = getLocalAddressCoordinates(toAddress);

        setFromCoords(from);
        setToCoords(to);
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
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Suivi de livraison" showBackButton={true} />
      
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={100} color="#ddd" />
        <Text style={styles.mapText}>Carte hors ligne</Text>
        
        {fromCoords && (
          <View style={styles.coordinateBox}>
            <Text style={styles.coordinateTitle}>Départ:</Text>
            <Text>Lat: {fromCoords.latitude.toFixed(4)}</Text>
            <Text>Lng: {fromCoords.longitude.toFixed(4)}</Text>
          </View>
        )}

        {toCoords && (
          <View style={styles.coordinateBox}>
            <Text style={styles.coordinateTitle}>Arrivée:</Text>
            <Text>Lat: {toCoords.latitude.toFixed(4)}</Text>
            <Text>Lng: {toCoords.longitude.toFixed(4)}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#44076a" />
          <Text style={styles.infoText}>{fromAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="flag" size={20} color="#ff6b6b" />
          <Text style={styles.infoText}>{toAddress}</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 10,
  },
  mapText: {
    marginTop: 10,
    color: '#888',
    fontSize: 18,
  },
  coordinateBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    width: '80%',
  },
  coordinateTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
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
  infoText: {
    fontSize: 14,
    marginLeft: 10,
  },
  deliveryId: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TrackingScreen;