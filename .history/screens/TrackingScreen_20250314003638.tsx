import { MaterialIcons } from '@expo/vector-icons'; // For icons
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const Sign = ({ locationAddress, destinationAddress }) => {
  return (
    <View style={styles.signContainer}>
      <Text style={styles.signTitle}>Localisation de colis</Text>
      <View style={styles.addressContainer}>
        <MaterialIcons name="place" size={34} color="#B4DFFF" />
        <Text style={styles.signText}>{locationAddress || 'Loading...'}</Text>
      </View>
      {destinationAddress && (
        <>
          <Text style={styles.signTitle}>Destination</Text>
          <View style={styles.addressContainer}>
            <MaterialIcons name="place" size={34} color="#B4DFFF" />
            <Text style={styles.signText}>{destinationAddress}</Text>
          </View>
        </>
      )}
    </View>
  );
};

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
        setDistanceRemaining(data.routes[0].distance / 1000); // Convert meters to kilometers
      }
    } catch (error) {
      console.error("Error fetching route:", error);
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
            strokeColor="#0076C7"
          />
        )}
      </MapView>
      <View style={styles.controls}>
      <TouchableOpacity style={styles.trackButton} onPress={handleStartTracking}>
      <Text style={styles.buttonText}>Start Tracking</Text>
    </TouchableOpacity>      
    </View>
      {distanceRemaining !== null && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance restante: {distanceRemaining.toFixed(2)} km</Text>
        </View>
      )}
      <Sign locationAddress={locationAddress} destinationAddress={destinationAddress} />
    </View>
      {/* Location Info Panel */}
      <View style={styles.locationPanel}>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>My Location</Text>
            <Text style={styles.locationAddress}>{locationAddress || '3150 Mine RD, Near New York 10001'}</Text>
          </View>
        </View>
        
        <View style={styles.locationDivider} />
        
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="white" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>My Express</Text>
            <Text style={styles.locationAddress}>{destinationAddress || '2454 Royal Ln, Mesa, New Jersey...'}</Text>
          </View>
        </View>
      </View>
      
      {/* Courier Info Panel */}
      <View style={styles.courierPanel}>
        <View style={styles.courierProfileContainer}>
          <View style={styles.courierAvatar}>
            <MaterialCommunityIcons name="truck-delivery" size={22} color="#D73030" />
          </View>
          <View style={styles.courierInfo}>
            <Text style={styles.courierName}>Linda Lindsey</Text>
            <Text style={styles.courierType}>Courier - Regular</Text>
          </View>
          <View style={styles.courierActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="phone" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.packageInfoContainer}>
          <View style={styles.packageInfo}>
            <Text style={styles.packageInfoLabel}>Package Weight</Text>
            <Text style={styles.packageInfoValue}>1 KG</Text>
          </View>
          <View style={styles.packageStatus}>
            <Text style={styles.packageStatusText}>Processing</Text>
          </View>
        </View>
        
        {/* Package Image */}
        <View style={styles.packageImageContainer}>
          <Image 
            source={require('./assets/package.png')} 
            style={styles.packageImage}
            // If you don't have this image, you can replace with a placeholder or remove this section
          />
        </View>
      </View>
    </  {/* Location Info Panel */}
    <View style={styles.locationPanel}>
      <View style={styles.locationInfo}>
        <MaterialIcons name="location-on" size={24} color="white" />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>My Location</Text>
          <Text style={styles.locationAddress}>{locationAddress || '3150 Mine RD, Near New York 10001'}</Text>
        </View>
      </View>
      
      <View style={styles.locationDivider} />
      
      <View style={styles.locationInfo}>
        <MaterialIcons name="location-on" size={24} color="white" />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>My Express</Text>
          <Text style={styles.locationAddress}>{destinationAddress || '2454 Royal Ln, Mesa, New Jersey...'}</Text>
        </View>
      </View>
    </View>
    
    {/* Courier Info Panel */}
    <View style={styles.courierPanel}>
      <View style={styles.courierProfileContainer}>
        <View style={styles.courierAvatar}>
          <MaterialCommunityIcons name="truck-delivery" size={22} color="#D73030" />
        </View>
        <View style={styles.courierInfo}>
          <Text style={styles.courierName}>Linda Lindsey</Text>
          <Text style={styles.courierType}>Courier - Regular</Text>
        </View>
        <View style={styles.courierActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="phone" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="chat" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.packageInfoContainer}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageInfoLabel}>Package Weight</Text>
          <Text style={styles.packageInfoValue}>1 KG</Text>
        </View>
        <View style={styles.packageStatus}>
          <Text style={styles.packageStatusText}>Processing</Text>
        </View>
      </View>
      
      {/* Package Image */}
      <View style={styles.packageImageContainer}>
        <Image 
          source={require('./assets/package.png')} 
          style={styles.packageImage}
          // If you don't have this image, you can replace with a placeholder or remove this section
        />
      </View>
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
    padding: 10,
    borderRadius: 10,
  },
  distanceContainer: {
    position: 'absolute',
    top: 50,
    left: '40%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#0076C7',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    paddingLeft:31

  },
  signTitle: {
    color: '#B4DFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
paddingLeft:28
  },
  signText: {
    color: '#B4DFFF',
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackButton: {
    backgroundColor: '#0076C7', // Change this to your desired button color
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});