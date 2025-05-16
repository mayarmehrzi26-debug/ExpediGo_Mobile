import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
  clientEmail?: string;
}

interface OrderCardProps {
  navigation: any;
}

const DeliveryCard2: React.FC<OrderCardProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      const q = query(collection(firebasestore, 'livraisons'));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const clientSnapshot = await getDocs(collection(firebasestore, 'clients'));
        const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

        const addressSnapshot = await getDocs(collection(firebasestore, 'adresses'));
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
          origin: clientData?.address || "origine inconnue",
          destination: addressData?.address || "destination inconnue",
          date: formattedDate,
          status: data.status || "Non traité",
          clientEmail: clientData?.email || "",
        };
      }));

      // Filtrer uniquement les commandes avec statut "Non traité"
      const filteredOrders = deliveriesList.filter(order => order.status === 'Non traité');
      setOrders(filteredOrders);
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
        const orderRef = doc(firebasestore, 'livraisons', selectedOrder.id);
        await updateDoc(orderRef, {
          status: "En attente d'enlèvement"
        });
        setModalVisible(false);
        fetchOrders(); // Rafraîchir la liste après modification
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            onPress={() => navigation.navigate('PackageDetails', { orderId: order.id })}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={require('../../assets/image.png')} style={styles.icon} />
                <View style={styles.cardDetails}>
                  <Text style={styles.orderNumber}>Commande {order.id}</Text>
                  <Text style={styles.orderText}>De: {order.origin}</Text>
                  <Text style={styles.orderText}>Vers: {order.destination}</Text>
                </View>
              </View>
              <View style={styles.dateContainer}>
                <MaterialIcons name="date-range" size={16} color="black" />
                <Text style={styles.orderText}>{order.date}</Text>
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
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune nouvelle commande</Text>
      )}

      {/* Modal de confirmation */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Êtes-vous sûr de livrer cette commande ?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmDelivery}
              >
                <Text style={styles.modalButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F1EEFF',
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 90,
    height: 110,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  orderText: {
    color: '#555',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#877DAB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noOrders: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#877DAB',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    width: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeliveryCard2;