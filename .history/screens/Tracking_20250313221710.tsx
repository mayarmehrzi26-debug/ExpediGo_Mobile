

import { ArrowLeft, Bell, Clock, Home, MapPin, Search, ShoppingCart, Star } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Tracking = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Map View Container */}
      <View style={styles.mapContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.searchBar}>
            <Search size={18} color="#a088ca" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="#888"
            />
          </View>
        </View>
        
        {/* Map Content - This would be an actual map in a real app */}
        <View style={styles.mapContent}>
          {/* Map Markers */}
          <View style={[styles.marker, { top: '40%', left: '18%' }]}>
            <Image 
              source={{ uri: 'https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png' }} 
              style={styles.restaurantIcon}
            />
          </View>
          
          <View style={[styles.marker, { top: '20%', left: '35%' }]}>
            <Image 
              source={{ uri: 'https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png' }} 
              style={styles.restaurantIcon}
            />
          </View>
          
          <View style={[styles.marker, { top: '25%', right: '25%' }]}>
            <Image 
              source={{ uri: 'https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png' }} 
              style={styles.restaurantIcon}
            />
          </View>
          
          <View style={[styles.marker, { bottom: '30%', right: '15%' }]}>
            <Image 
              source={{ uri: 'https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png' }} 
              style={styles.restaurantIcon}
            />
          </View>
          
          {/* Active Location */}
          <View style={[styles.activeMarker, { top: '35%', left: '12%' }]}>
            <View style={styles.purpleDot} />
          </View>
          
          {/* Purple Path */}
          <View style={styles.purplePath1} />
          <View style={styles.purplePath2} />
          
          {/* Street Labels */}
          <Text style={[styles.streetLabel, { top: '15%', left: '5%' }]}>Jl. Kori</Text>
          <Text style={[styles.streetLabel, { bottom: '20%', left: '30%' }]}>Jl. Ninduk</Text>
        </View>
        
        {/* Restaurant Details Card */}
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantInfo}>
            <Image 
              source={{ uri: 'https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png' }} 
              style={styles.restaurantLogo}
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>Junkie</Text>
              <Text style={styles.restaurantAddress}>Jl. Rameyan No 321, Santui City</Text>
              
              <View style={styles.restaurantStats}>
                <View style={styles.statItem}>
                  <Star size={14} color="#FFB800" />
                  <Text style={styles.statText}>4.5</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Clock size={14} color="#F06292" />
                  <Text style={styles.statText}>11 minutes</Text>
                </View>
                
                <View style={styles.statItem}>
                  <MapPin size={14} color="#9C64FF" />
                  <Text style={styles.statText}>1.9 km</Text>
                </View>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.checkButton}>
            <Text style={styles.checkButtonText}>Check Restaurant Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <View style={styles.navActiveIcon}>
            <MapPin size={20} color="#fff" />
          </View>
          <Text style={styles.navActiveText}>Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <ShoppingCart size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Bell size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333',
  },
  mapContent: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    marginTop: 16,
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  activeMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  purpleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9C64FF',
  },
  restaurantIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  purplePath1: {
    position: 'absolute',
    width: 100,
    height: 3,
    backgroundColor: '#9C64FF',
    top: '35%',
    left: '20%',
    transform: [{ rotate: '30deg' }],
    borderRadius: 2,
  },
  purplePath2: {
    position: 'absolute',
    width: 120,
    height: 3,
    backgroundColor: '#9C64FF',
    top: '42%',
    right: '20%',
    transform: [{ rotate: '-70deg' }],
    borderRadius: 2,
  },
  streetLabel: {
    position: 'absolute',
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  restaurantCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restaurantInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  restaurantAddress: {
    color: '#888',
    fontSize: 13,
    marginBottom: 6,
  },
  restaurantStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#555',
  },
  checkButton: {
    backgroundColor: '#9C64FF',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C64FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  navActiveText: {
    fontSize: 12,
    color: '#9C64FF',
    fontWeight: '500',
  },
});
export default Tracking;
