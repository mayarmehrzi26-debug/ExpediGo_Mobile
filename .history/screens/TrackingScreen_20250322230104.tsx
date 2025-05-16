import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

// Composant principal de suivi
export default function TrackingScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [destination] = useState({
    latitude: 35.821322023919215,
    longitude: 10.613544047427933,
  });
  const [route, setRoute] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      fetchRoute(currentLocation.coords, destination);

      const address = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (address.length > 0) {
        setLocationAddress(`${address[0].name}, ${address[0].city}, ${address[0].region}`);
      }

      const destAddress = await Location.reverseGeocodeAsync(destination);
      if (destAddress.length > 0) {
        setDestinationAddress(`${destAddress[0].name}, ${destAddress[0].city}, ${destAddress[0].region}`);
      }
    })();
  }, []);

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        setRoute(coordinates);
        setDistanceRemaining(data.routes[0].distance / 1000);

        const latitudes = coordinates.map((coord) => coord.latitude);
        const longitudes = coordinates.map((coord) => coord.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const padding = 0.05;
        setMapRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: maxLat - minLat + padding,
          longitudeDelta: maxLng - minLng + padding,
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack(); // Retour à l'écran précédent
  };

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!location) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {/* Bouton de retour */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={
            mapRegion || {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          }
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
            />
          )}
          {route.length > 0 && (
            <Polyline
              coordinates={route}
              strokeWidth={4}
              strokeColor="#0076C7"
            />
          )}
        </MapView>
        {distanceRemaining !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              Distance restante: {distanceRemaining.toFixed(2)} km
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#877DAB',
    padding: 10,
    borderRadius: 30,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20, // Ajout du borderRadius pour arrondir la carte
    overflow: 'hidden', // Nécessaire pour appliquer le borderRadius sur la carte
  },
  map: {
    flex: 1,
  },
  distanceContainer: {
    position: 'absolute',
    top: 20,
    left: '30%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
