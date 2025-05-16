import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const OrderCard = () => {
    const handleButtonPress = () => {
        // Logique à exécuter lorsque le bouton est pressé
        console.log("Button pressed");
      };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={require('../../assets/package.png')} style={styles.icon} />
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Commande #123456789</Text>
          <Text style={styles.orderText}>De: Sahloul,Sousse</Text>
          <Text style={styles.orderText}>Vers: Msaken,Sousse</Text>
          <View style={styles.dateContainer}>
            <MaterialIcons name="date-range" size={16} color="black" />
            <Text style={styles.orderText}> 09/02/25</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>je livre</Text>
      </TouchableOpacity>
    </View>
    
  );
};


const styles = StyleSheet.create({
 

  
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius:12,
    elevation: 5,
    marginTop:32,
    marginLeft:22,
    marginRight:22,

  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
  },
  orderText: {
    color: "#555",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#3b1488",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    marginLeft:222,
    
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderCard;
