import * as turf from '@turf/turf';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { firebasestore } from './Fireimport * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

export default function TrackingScreen() {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
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
        setDistanceRemaining(data.routes[0].distance / 1000); // Convert meters to kilometers
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleChooseDestination = () => {
    const destinationCoords = {
      latitude: 35.821322023919215,
      longitude: 10.613544047427933,
    };
    setDestination(destinationCoords);

    if (location) {
      fetchRoute(location.coords, destinationCoords);
    }
  };

  const handleStartTracking = async () => {
    if (destination) {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          fetchRoute(newLocation.coords, destination);
        }
      );

      return () => subscription.remove();
    }
  };

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!location) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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
            strokeColor="blue"
          />
        )}
      </MapView>
      <View style={styles.controls}>
        <Button title="Choose Destination" onPress={handleChooseDestination} />
        <Button title="Start Tracking" onPress={handleStartTracking} />
      </View>
      {distanceRemaining !== null && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance restante: {distanceRemaining.toFixed(2)} km</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distanceContainer: {
    position: 'absolute',
    top: 50,
    left: '40%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});baseConfig';

export default function TrackingScreen() {
    const [location, setLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [route, setRoute] = useState([]);
    const [directions, setDirections] = useState([]);

    useEffect(() => {
        let interval;
        if (tracking) {
            interval = setInterval(async () => {
                try {
                    let { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                    setLocation(coords);
                    setRoute(prevRoute => [...prevRoute, coords]);
                    await addDoc(collection(db, 'locations'), { latitude: coords.latitude, longitude: coords.longitude, timestamp: Date.now() });
                } catch (error) {
                    console.error("Erreur lors de la récupération de la localisation", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [tracking]);

    const handleMapPress = async (event) => {
        const dest = event.nativeEvent.coordinate;
        setDestination(dest);
        if (location) {
            generateRoute(location, dest);
        }
    };

    const generateRoute = (origin, destination) => {
        const start = turf.point([origin.longitude, origin.latitude]);
        const end = turf.point([destination.longitude, destination.latitude]);
        const line = turf.lineString([start.geometry.coordinates, end.geometry.coordinates]);
        const steps = turf.lineChunk(line, 0.001).features.map(f => ({ latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] }));
        setDirections(steps);
    };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={{ latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.05, longitudeDelta: 0.05 }} onPress={handleMapPress}>
                {location && <Marker coordinate={location} title="Vous" />}
                {destination && <Marker coordinate={destination} title="Destination" pinColor="blue" />}
                {route.length > 0 && <Polyline coordinates={route} strokeWidth={3} strokeColor="red" />}
                {directions.length > 0 && <Polyline coordinates={directions} strokeWidth={3} strokeColor="blue" />}
            </MapView>
            <Button title={tracking ? "Arrêter" : "Commencer"} onPress={() => setTracking(!tracking)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 }
});
