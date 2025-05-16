import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';
import StatusBadge from './StatusBadge';




const CommandeCard: React.FC = () => {





  return (
    <View>
     
        
           
          </View>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}

     
      )}
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
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
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
    fontSize: 18,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  noOrders: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  badgeContainer: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  statusOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    textAlign: "center",
  },
  button: {
    backgroundColor: "red",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CommandeCard;