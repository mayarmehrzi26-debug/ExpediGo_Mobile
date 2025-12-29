// src/features/ticket/views/TicketListView.tsx
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { firebaseAuth } from "../../../FirebaseConfig";
import NavBottom from "../../../src/components/shared/NavBottom";
import Header from "../../components/Header";
import InvoiceDocument from "../components/InvoiceDocument";
import { Ticket } from "../models/TicketModel";
import { TicketListPresenter } from "../presenters/TicketListPresenter";

const TicketListView: React.FC = ({ navigation }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState("Support");
  const [isAdmin, setIsAdmin] = useState(false);
  const [presenter, setPresenter] = useState<TicketListPresenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const adminStatus = await checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
        const newPresenter = new TicketListPresenter({
          setTickets: (tickets) => {
            setTickets(tickets);
            setLoading(false);
          },
          showError: (message) => console.error(message),
          showImage: (imageUrl) => {
            setSelectedImage(imageUrl);
            setImageModalVisible(true);
          }
        }, adminStatus);
        setPresenter(newPresenter);
        newPresenter.loadTickets();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTicketPress = (ticket: Ticket) => {
    if (ticket.imageUrl) {
      presenter?.showTicketImage(ticket);
    } else {
      setSelectedTicket(ticket);
      setModalVisible(true);
    }
  };

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    // Implémentez votre logique de vérification admin ici
    return false;
  };

  const refreshTickets = () => {
    if (presenter) {
      setLoading(true);
      presenter.loadTickets();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Tickets" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#877DAB" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Tickets" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        {tickets.length === 0 ? (
          <Text style={styles.noTicketsText}>Aucun ticket trouvé</Text>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity 
              key={ticket.id} 
              onPress={() => handleTicketPress(ticket)}
            >
              <InvoiceDocument
                documentNumber={ticket.id}
                ticketNumber={ticket.bordereau || "N/A"}
                ticketTitle={ticket.titre || "N/A"}
                ticketService={ticket.service || "N/A"}
                ticketType={ticket.type || "N/A"}
                ticketStatus={ticket.status || "N/A"}
                date={ticket.createdAt?.toLocaleDateString() || "N/A"}
                time={ticket.createdAt?.toLocaleTimeString() || "N/A"}
              />
              {ticket.imageUrl && (
                <Text style={styles.hasImageText}>📷 Preuve incluse</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal pour la réponse du ticket */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Réponse du ticket #{selectedTicket?.id}</Text>
            
            {selectedTicket?.response ? (
              <Text style={styles.modalText}>{selectedTicket.response}</Text>
            ) : (
              <Text style={styles.modalText}>Aucune réponse pour ce ticket</Text>
            )}

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal pour l'image */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.imageModalContainer}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          <Image 
            source={{ uri: selectedImage || '' }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddTicket", { refreshTickets })}
      >
        <Ionicons name={"add"} size={24} color="white" />
      </TouchableOpacity>
      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 30,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#877DAB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTicketsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
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
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: '#877DAB',
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: 100,
  },
  buttonClose: {
    backgroundColor: "#877DAB",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  hasImageText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#877DAB',
    fontSize: 12,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});

export default TicketListView;