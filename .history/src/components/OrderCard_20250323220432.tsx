import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig'; // Importation Firestore
import sendEmail from '../../src/services/emailService'; // Assure-toi du bon chemin d'importation

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
  clientEmail?: string; // Ajout de l'email du client
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
          origin: clientData?.address || "origine inconnue",
          destination: addressData?.address || "destination inconnue",
          date: formattedDate,
          status: data.status || "En attente",
          clientEmail: clientData?.email || "", // Récupérer l'email du client
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
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);

        // 🔹 Mettre à jour le statut de la commande dans "livraisons"
        await updateDoc(orderRef, {
          status: "En attente d'enlévement", // Ou tout autre statut approprié
          deliveredAt: Timestamp.now(),
        });

        // 🔹 Générer l'URL du code QR
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=Commande%20ID:${selectedOrder.id}&size=150x150`;

        // 🔹 Définir le message à envoyer
        const message = `Votre colis est pris en charge.\nVous pouvez suivre votre colis à travers l'ID de commande: ${selectedOrder.id}.\nVoici votre code QR pour le suivi: ${qrCodeUrl}`;

        // 🔹 Envoyer l'email au client
        const emailTitle = "Confirmation de livraison"; // Titre de l'email
        await sendEmail(emailTitle, selectedOrder.clientEmail || "", message); // Envoi de l'email

        // 🔹 Mettre à jour l'UI
        setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
        setModalVisible(false);
      } catch (error) {
        console.error("Erreur lors de la confirmation de la livraison :", error);
      }
    }
  };

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
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
    backgroundColor: "#F1EEFF",
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
    width: 90,
    height: 110,
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
    backgroundColor: "#877DAB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 5,
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