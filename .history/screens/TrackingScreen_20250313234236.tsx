import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

// Sign component from the provided code
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

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!location) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Map View */}
      <View style={styles.mapContainer}>
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
              strokeColor="#0078D7"
            />
          )}
        </MapView>
        
        {/* Live Tracking Header */}
        <View style={styles.liveTrackingHeader}>
          <Text style={styles.liveTrackingText}>Live Tracking</Text>
          <TouchableOpacity style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {distanceRemaining !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>Distance: {distanceRemaining.toFixed(2)} km</Text>
          </View>
        )}
        
        {!isLiveTracking && (
          <View style={styles.trackingButton}>
            <Button title="Start Tracking" onPress={handleStartTracking} color="#0078D7" />
          </View>
        )}
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
            source={require('../assets/package.png')} 
            style={styles.packageImage}
            // If you don't have this image, you can replace with a placeholder or remove this section
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  liveTrackingHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  liveTrackingText: {
    color: '#D73030',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#D73030',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    top: 60,
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
  trackingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  locationPanel: {
    backgroundColor: '#0078D7',
    borderRadius: 12,
    margin: 15,
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
    backgroundColor: '#E8F4FF',
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
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  packageInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  packageInfo: {},
  packageInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  packageInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  packageStatus: {
    backgroundColor: '#E8F4FF',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  packageStatusText: {
    color: '#0078D7',
    fontWeight: '500',
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  packageImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  signContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#0056b3',
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