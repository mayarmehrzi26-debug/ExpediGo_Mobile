import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const OrderCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={require('../../assets/package.png')} style={styles.icon} />
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Order #123456789</Text>
          <Text style={styles.orderText}>From: Lorem Ipsum</Text>
          <Text style={styles.orderText}>To: Dolor Sit</Text>
          <View style={styles.dateContainer}>
            <MaterialIcons name="date-range" size={16} color="black" />
            <Text style={styles.orderText}> 03/15/22 - 13/23/22</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      <View style={styles.cardHeader}>
        <Image source={require('../../assets/package.png')} style={styles.icon} />
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Order #123456789</Text>
          <Text style={styles.orderText}>From: Lorem Ipsum</Text>
          <Text style={styles.orderText}>To: Dolor Sit</Text>
          <View style={styles.dateContainer}>
            <MaterialIcons name="date-range" size={16} color="black" />
            <Text style={styles.orderText}> 03/15/22 - 13/23/22</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
 

  
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius:12,
    elevation: 5,
    marginTop:42,
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
  progressBar: {
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 10,
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 5,
  },
});

export default OrderCard;
