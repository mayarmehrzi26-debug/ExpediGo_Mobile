import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
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

const extractNumericId = (id: string, length: number = 3): number => {
  const numericString = id.replace(/\D/g, "");
  const truncatedString = numericString.slice(0, length);
  return truncatedString ? parseInt(truncatedString, 10) : 0;
};

const CommandeCard: React.FC<{ delivery: any }> = ({ delivery }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
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

  const handleConfirmDelivery = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id.toString());

        // Update the status of the order to "En cours de livraison"
        await setDoc(orderRef, { ...selectedOrder, status: "En cours de livraison" }, { merge: true });

        setModalVisible(false);
      } catch (error) {
        console.error("Error updating delivery status:", error);
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={require('../../assets/package.png')} style={styles.icon} />
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Commande #{delivery.id}</Text>
          <Text style={styles.orderText}>De: {delivery.origin}</Text>
          <Text style={styles.orderText}>Vers: {delivery.destination}</Text>
          <View style={styles.dateContainer}>
            <MaterialIcons name="date-range" size={16} color="black" />
            <Text style={styles.orderText}>{delivery.date}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSelectedOrder(delivery);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Je livre</Text>
        </TouchableOpacity>
      </Animated.View>

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

export default CommandeCard;
