import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';
import StatusBadge from './StatusBadge';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
}

const CommandeCard: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
        const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

        const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
        const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

        let formattedDate = "Date inconnue";
        if (data.createdAt instanceof Timestamp) {
          const dateObj = data.createdAt.toDate();
          formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (data.date) {
          formattedDate = data.date;
        }

        return {
          id: doc.id,
          origin: clientData?.address || "origine inconnu",
          destination: addressData?.address || "destination inconnue",
          date: formattedDate,
          status: data.status || "Statut inconnu", // Assurez-vous que le statut est inclus
        };
      }));

      setOrders(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require('../../assets/package.png')} style={styles.icon} />
              <View style={styles.cardDetails}>
                
                <Text style={styles.orderNumber}>Commande #{order.id}</Text>
                <StatusBadge status={order.status} /> 

                <View style={styles.dateContainer}>
                  
                  <MaterialIcons name="date-range" size={16} color="black" />
                  <Text style={styles.orderText}>{order.date}</Text>
                </View>
              </View>
            </View>
           
          </View>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
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
    borderRadius: 32,
    elevation: 5,
    marginTop: 16,
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
    fontSize: 16,
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
 
});

export default CommandeCard;