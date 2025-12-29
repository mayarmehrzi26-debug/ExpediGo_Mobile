// src/features/ticket/views/TicketListView.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable,ScrollView,Modal,Text, StyleSheet, TouchableOpacity, View,ActivityIndicator } from "react-native";
import Header from "../../components/Header";
import InvoiceDocument from "../components/InvoiceDocument";
import NavBottom from "../../../src/components/shared/NavBottom";
import { TicketListPresenter } from "../presenters/TicketListPresenter";
import { firebaseAuth } from "../../../FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const TicketListView: React.FC = ({ navigation }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeScreen, setActiveScreen] = useState("Support");
  const [isAdmin, setIsAdmin] = useState(false);
  const [presenter, setPresenter] = useState<TicketListPresenter | null>(null);
  const [loading, setLoading] = useState(true);
 const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        // Check if user is admin (you'll need to implement this logic)
        const adminStatus = await checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
        const newPresenter = new TicketListPresenter({
          setTickets: (tickets) => {
            setTickets(tickets);
            setLoading(false);
          },
          showError: (message) => console.error(message),
          showImage(imageUrl: string): void;
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
    setSelectedTicket(ticket);
    setModalVisible(true);
  };
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    // Implement your admin check logic here
    // This could check Firestore or Firebase Auth custom claims
    return false; // Default to false
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
  <Text style={styles.noTicketsText}>No tickets found</Text>
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
    </TouchableOpacity>
  ))
)}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
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
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Fermer</Text>
            </Pressable>
          </View>
        </View>
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
});

export default TicketListView;