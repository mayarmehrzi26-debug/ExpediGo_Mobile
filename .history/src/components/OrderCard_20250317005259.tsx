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

  const handleConfirmDelivery = async () => {
    if (selectedOrder) {
      try {
        // Reference to the current order in "livraisons"
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id.toString());
    
        // Reference to the new document in "Orders"
        const newOrderRef = doc(firebasestore, "Orders", selectedOrder.id.toString());
    
        // Get the document snapshot from "livraisons" (using getDoc instead of getDocs)
        const orderSnapshot = await getDoc(orderRef);
        
        if (!orderSnapshot.exists()) {
          console.error("Order does not exist!");
          return;
        }
    
        const orderData = orderSnapshot.data();
    
        // Copy the document from "livraisons" to "Orders" without any changes
        await setDoc(newOrderRef, {
          ...orderData, // copy all fields as-is
          status: "En attente", // If you want to update the status in "Orders", keep this line; otherwise, remove it
          deliveredAt: Timestamp.now(), // Add a timestamp of delivery if needed
        });
    
        // Delete the order from "livraisons" after confirmation
        await deleteDoc(orderRef);
    
        // Update the local state to remove the confirmed order
        setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
    
        // Close the modal
        setModalVisible(false);
  
        // Appeler l'API d'envoi d'e-mail après la confirmation de la livraison
        if (selectedOrder) {
          try {
            console.log('Envoi de la requête à l\'API...');
            const response = await fetch('http://192.168.199.160:3000/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: orderData.clientEmail,
                orderId: selectedOrder.id,
                message: `Votre commande #${selectedOrder.id} a été livrée avec succès.`,
              }),
            });
      
            console.log('Réponse du serveur:', response);
            if (response.ok) {
              console.log('E-mail envoyé avec succès');
            } else {
              console.error('Erreur lors de l\'envoi de l\'e-mail');
            }
          } catch (error) {
            console.error('Erreur lors de l\'envoi de la requête:', error);
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
