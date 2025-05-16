import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Button, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';

const OrderCard = ({ onConfirmDelivery }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);
      const deliveriesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);
        await updateDoc(orderRef, { status: "À livrer" });
        onConfirmDelivery(selectedOrder);
        setOrders(orders.filter(order => order.id !== selectedOrder.id));
        setModalVisible(false);
      } catch (error) {
        console.error("Error updating order:", error);
      }
    }
  };

  return (
    <View>
      {orders.map(order => (
        <View key={order.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={require('../../assets/package.png')} style={styles.icon} />
            <View style={styles.cardDetails}>
              <Text style={styles.orderNumber}>Commande #{order.id}</Text>
              <Text style={styles.orderText}>De: {order.origin}</Text>
              <Text style={styles.orderText}>Vers: {order.destination}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setSelectedOrder(order);
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Je livre</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ))}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Êtes-vous sûr de livrer ce colis?</Text>
            <View style={styles.modalButtons}>
              <Button title="Non" onPress={() => setModalVisible(false)} />
              <Button title="Oui" onPress={handleConfirmDelivery} />
            </View>
          </View>
        </View>
      </Modal>
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
  button: {
    backgroundColor: "#44076a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noOrders: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
  },
  modalButtonConfirm: {
    backgroundColor: "#44076a",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderCard;
