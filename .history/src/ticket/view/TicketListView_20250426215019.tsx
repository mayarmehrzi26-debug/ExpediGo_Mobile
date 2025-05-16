import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import InvoiceDocument from "../components/InvoiceDocument";
import NavBottom from "../../components/NavBottom";
import { TicketListPresenter } from "../presenters/TicketListPresenter";

const TicketListView: React.FC = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [activeScreen, setActiveScreen] = useState("Support");
  const [presenter] = useState(new TicketListPresenter({
    setTickets: (tickets) => setTickets(tickets),
    showError: (message) => console.error(message),
  }));

  useEffect(() => {
    presenter.loadTickets();
  }, []);

  const refreshTickets = () => {
    presenter.loadTickets();
  };

  return (
    <View style={styles.container}>
      <Header title="Tickets" showBackButton={true} />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddTicket", { refreshTickets })}
      >
        <Ionicons name={"add"} size={54} color="white" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        {tickets.map((ticket) => (
          <InvoiceDocument
            key={ticket.id}
            documentNumber={ticket.id}
            ticketNumber={ticket.bordereau || "N/A"}
            ticketTitle={ticket.titre || "N/A"}
            ticketService={ticket.service || "N/A"}
            ticketType={ticket.type || "N/A"}

            ticketStatus={ticket.status || "N/A"}
            date={ticket.createdAt?.toLocaleDateString() || "N/A"}
            time={ticket.createdAt?.toLocaleTimeString() || "N/A"}
          />
        ))}
      </ScrollView>
     
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
    marginRight: 22
  },
  floatingButton: {
    width: 
    6,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginLeft: 260,
  },
});

export default TicketListView;