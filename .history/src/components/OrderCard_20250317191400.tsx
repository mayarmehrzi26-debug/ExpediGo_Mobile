import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig'; // Importation Firestore

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
}



const OrderCard: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]); // Stocker les commandes
  const [modalVisible, setModalVisible] = useState(false); // Modal de confirmation
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Commande sélectionnée

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
          status: data.status || "En attente",
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

// Assume you have an email sending function
const sendEmail = async (to, orderId) => {
  const apiKey = 'pubkey-fa1e412c028ffca2db5f9803951ea642
'; // Replace with your Mailgun API key
  const domain = 'mayar.com'; // Replace with your Mailgun verified domain

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa('api:' + apiKey)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: 'Mayar  <mayar@mayar.com>', // Replace with your sender email
        to: to,
        subject: 'Votre colis est pris en charge',
        text: `Votre colis est pris en charge. Vous pouvez suivre votre colis avec orderId=${orderId}.`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const handleConfirmDelivery = async () => {
  if (selectedOrder) {
    try {
      const orderRef = doc(firebasestore, "livraisons", selectedOrder.id.toString());
      const orderSnapshot = await getDoc(orderRef);
      
      if (!orderSnapshot.exists()) {
        console.error("Order does not exist!");
        return;
      }

      const orderData = orderSnapshot.data();
      const clientEmail = orderData.clientEmail; // Assuming you have client email in order data

      await setDoc(doc(firebasestore, "Orders", selectedOrder.id.toString()), {
        ...orderData,
        status: "En attente",
        deliveredAt: Timestamp.now(),
      });

      await deleteDoc(orderRef);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));

      // Send email to the client
      await sendEmail(clientEmail, selectedOrder.id);

      setModalVisible(false);
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  }
};
  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require('../../assets/package.png')} style={styles.icon} />
              <View style={styles.cardDetails}>
                <Text style={styles.orderNumber}>Commande #{order.id}</Text>
                <Text style={styles.orderText}>De: {order.origin}</Text>
                <Text style={styles.orderText}>Vers: {order.destination}</Text>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="date-range" size={16} color="black" />
                  <Text style={styles.orderText}>{order.date}</Text> 
                </View>
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
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}

      {/* Modal de confirmation */}
      {selectedOrder && (
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
  button: {
    backgroundColor: "#44076a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: 'flex-end',
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#44076a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderCard;
