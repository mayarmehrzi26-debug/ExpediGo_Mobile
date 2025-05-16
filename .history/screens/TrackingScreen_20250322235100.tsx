import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

// Composant pour afficher l'adresse de localisation
const Sign = ({ locationAddress, destinationAddress }) => {
  return (
    <View style={styles.signContainer}>
      <Text style={styles.signTitle}>My Location</Text>
      <View style={styles.addressContainer}>
        <MaterialIcons name="place" size={24} color="white" />
        <Text style={styles.signText}>{locationAddress || 'Loading...'}</Text>
      </View>
      {destinationAddress && (
        <>
          <Text style={styles.signTitle}>My Express</Text>
          <View style={styles.addressContainer}>
            <MaterialIcons name="place" size={24} color="white" />
            <Text style={styles.signText}>{destinationAddress}</Text>
          </View>
        </>
      )}
    </View>
  );
};

// Composant principal de suivi
export default function TrackingScreen() {
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
  const [isLiveTracking, setIsLiveTracking] = useState(false);
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
        setDistanceRemaining(data.routes[0].distance / 1000); // Convertir mètres en kilomètres

        // Calculer la région pour englober le trajet
        const latitudes = coordinates.map(coord => coord.latitude);
        const longitudes = coordinates.map(coord => coord.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        // Définir une marge pour zoomer sur le trajet
        const padding = 0.05; // Ajustez cette valeur pour changer le zoom
        setMapRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) + padding,
          longitudeDelta: (maxLng - minLng) + padding,
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleStartTracking = async () => {
    setIsLiveTracking(true);
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

      return () => {
        subscription.remove();
        setIsLiveTracking(false);
      };
    }
  };

  // Fonction pour passer un appel
  const handleCall = () => {
    const phoneNumber = 'tel:+1234567890'; // Remplacez par le numéro de téléphone souhaité
    Linking.openURL(phoneNumber).catch(err => console.error('Error:', err));
  };

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!location) {
    return <Text>Loading...</Text>;
  }
  const handleBack = () => {
    navigation.goBack(); // Retour à l'écran précédent
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.container2}>

            <View style={styles.mapContainer}>

      <StatusBar style="auto" />
      
        <MapView
          style={styles.map}
          region={mapRegion || {
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
              strokeColor="#0076C7"
            />
          )}
        </MapView>
        {distanceRemaining !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>Distance restante: {distanceRemaining.toFixed(2)} km</Text>
          </View>
        )}
      </View>

      {/* Panneau d'informations de localisation */}
      
      <View style={styles.container2}>
      <Text style={styles.text}>Package tracking</Text>

      <View style={styles.locationPanel}>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={30} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Localisation de colis</Text>
            <Text style={styles.locationAddress}>{locationAddress || '3150 Mine RD, Near New York 10001'}</Text>
          </View>
        </View>
        
        <View style={styles.locationDivider} />
        
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={30} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Localisation de client</Text>
            <Text style={styles.locationAddress}>{destinationAddress || '2454 Royal Ln, Mesa, New Jersey...'}</Text>
          </View>
        </View>
      </View>
      
      {/* Panneau d'informations du livreur */}
      <View style={styles.courierPanel}>
        <View style={styles.courierProfileContainer}>
          <View style={styles.courierAvatar}>
            <MaterialCommunityIcons name="truck-delivery" size={22} color="#F06292" />
          </View>
          <View style={styles.courierInfo}>
            <Text style={styles.courierName}>Ahmed Attia</Text>
            <Text style={styles.courierType}>Livreur</Text>
          </View>
          <View style={styles.courierActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <MaterialIcons name="phone" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </View>
<View
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  container2: {
    backgroundColor: '#fff',
    borderTopRightRadius: 40,
    borderTopLeftRadius:40,

  },
  mapContainer: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop:100,
    borderRadius: 40, 
    overflow: 'hidden', // Nécessaire pour appliquer le borderRadius sur la carte
  },
  map: {
    flex: 1,
  },
  text: {
fontSize:25,
fontWeight:'bold',
paddingBottom:40,
paddingTop:80,
alignSelf:'center'

  },
  
  distanceContainer: {
    position: 'absolute',
    top: 60,
    left: '35%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
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
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationPanel: {
    backgroundColor: '#877DAB',
    borderRadius: 32,
    margin: 14,
    padding: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  locationTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  locationLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationAddress: {
    color: 'white',
    fontSize: 14,
  },
  locationDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
    marginLeft: 34,
  },
  courierPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 15,
    marginTop: 0,
  },
  courierProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1DBF2',
    borderRadius: 12,
    padding: 15,
  },
  courierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courierInfo: {
    flex: 1,
    marginLeft: 15,
  },
  courierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courierType: {
    fontSize: 14,
    color: '#666',
  },
  courierActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#877DAB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  signContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#0076C7',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  signTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signText: {
    color: 'white',
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
});