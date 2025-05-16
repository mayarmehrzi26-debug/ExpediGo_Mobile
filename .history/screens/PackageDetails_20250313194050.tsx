import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You would need to install expo/vector-icons in a React Native project

const FoodDetailScreen = () => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
      </View>
      
      {/* Food Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://8fcef4c7-65ea-40ef-93a6-9a562868685e.lovableproject.com/lovable-uploads/4c570dbb-f0d1-4e87-a9e1-1022e4ddd5c0.png' }}
          style={styles.foodImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Food Details Card */}
      <View style={styles.detailsCard}>
        {/* Food Title */}
        <Text style={styles.foodTitle}>French Fries</Text>
        <Text style={styles.portionText}>1 portion (for 1 people)</Text>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            French fries with a variety of delicious tomato sauces, added with a blend of spices that have been preserved for generations, making the food more delicious...
            <Text style={styles.learnMore}> Learn more</Text>
          </Text>
        </View>
        
        {/* Info Badges */}
        <View style={styles.infoBadges}>
          <View style={styles.infoBadge}>
            <Ionicons name="star" size={16} color="#F7B633" />
            <Text style={styles.infoText}>4.5</Text>
          </View>
          
          <View style={styles.infoBadge}>
            <Ionicons name="time" size={16} color="#F06292" />
            <Text style={styles.infoText}>7 minutes</Text>
          </View>
          
          <View style={styles.infoBadge}>
            <Ionicons name="location" size={16} color="#9C27B0" />
            <Text style={styles.infoText}>1.6 km</Text>
          </View>
        </View>
        
        {/* Price and Quantity */}
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.totalText}>Total amount</Text>
            <Text style={styles.priceText}>$23.00</Text>
          </View>
          
          <View style={styles.quantityControl}>
            <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDDF1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodImage: {
    width: '80%',
    height: '80%',
  },
  detailsCard: {
    flex: 0.65,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  portionText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  learnMore: {
    color: '#9C27B0',
    fontWeight: '500',
  },
  infoBadges: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  totalText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
  },
  addToCartButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Package;
