import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import StatusBadge from '../src/components/StatusBadge';

interface Delivery {
  id: string;
  client?: string;
  address?: string;
  date?: string;
  status?: string;
}

const Livraison: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);

  const fetchDeliveries = async () => {
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
          client: clientData?.name || "Client inconnu",
          address: addressData?.address || "Adresse inconnue",
          date: formattedDate,
          status: data.status || "Statut inconnu",
        };
      }));

      setDeliveries(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
      const statusList = statusSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().nomStat,
      }));
      setStatuses(statusList);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchStatuses();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <View key={delivery.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={require('../../assets/package.png')} style={styles.icon} />
                <View style={styles.cardDetails}>
                  <Text style={styles.orderNumber}>Livraison #{delivery.id}</Text>
                  <Text style={styles.orderText}>Client: {delivery.client}</Text>
                  <Text style={styles.orderText}>Adresse: {delivery.address}</Text>
                  <View style={styles.dateContainer}>
                    <MaterialIcons name="date-range" size={16} color="black" />
                    <Text style={styles.orderText}>{delivery.date}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </View>
              <TouchableOpacity onPress={() => {
                setSelectedDelivery(delivery);
                setModalVisible(true);
              }}>
                <StatusBadge status={delivery.status} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noDeliveries}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      {/* Modal pour la sélection du statut */}
      {selectedDelivery && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choisissez un nouveau statut</Text>
            {statuses.map((status) => (
              <TouchableOpacity key={status.id} onPress={() => {
                if (selectedDelivery) {
                  const deliveryRef = doc(firebasestore, "livraisons", selectedDelivery.id);
                  updateDoc(deliveryRef, { status: status.name })
                    .then(() => {
                      setDeliveries(prevDeliveries =>
                        prevDeliveries.map(del => 
                          del.id === selectedDelivery.id ? { ...del, status: status.name } : del
                        )
                      );
                      setModalVisible(false);
                    })
                    .catch(error => console.error("Error updating delivery status:", error));
                }
              }}>
                <Text style={styles.statusOption}>{status.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
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
  noDeliveries: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
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
});

export default Livraison;