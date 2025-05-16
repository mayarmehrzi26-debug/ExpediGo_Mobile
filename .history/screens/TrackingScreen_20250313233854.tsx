import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Map View */}
      <View style={styles.mapContainer}>
        {/* This would typically be a real map component like react-native-maps
            For this example, we're just showing a simplified representation */}
        <View style={styles.map} />
        
        {/* Live Tracking Header */}
        <View style={styles.liveTrackingHeader}>
          <Text style={styles.liveTrackingText}>Live Tracking</Text>
          <TouchableOpacity style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Route indicator (simplified) */}
        <View style={styles.route}>
          <View style={styles.routePin} />
        </View>
      </View>
      
      {/* Location Info Panel */}
      <View style={styles.locationPanel}>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="#0078D7" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>My Location</Text>
            <Text style={styles.locationAddress}>3150 Mine RD, Near New York 10001</Text>
          </View>
        </View>
        
        <View style={styles.locationDivider} />
        
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={24} color="#0078D7" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>My Express</Text>
            <Text style={styles.locationAddress}>2454 Royal Ln, Mesa, New Jersey...</Text>
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
            // If you don't have this image, you can replace with:
            // defaultSource={require('./assets/package-placeholder.png')}
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
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  map: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
  },
  closeButton: {
    backgroundColor: '#D73030',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  route: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 2,
    backgroundColor: '#666',
    transform: [{ translateX: -50 }, { translateY: -50 }, { rotate: '45deg' }],
  },
  routePin: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 12,
    height: 12,
    backgroundColor: '#D73030',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
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
});