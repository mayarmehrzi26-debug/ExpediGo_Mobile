import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import InvoiceDocument from "../src/components/InvoiceDocument";

const Support: React.FC = () => {
  const [tickets, setTickets] = useState([
    {
      documentNumber: "2440107",
      ticketNumber: "54884",
      ticketTitle: "Relance du colis",
      ticketService: "Service Commercial",
      ticketStatus: "Nouveau",
      assignedTo: "sdsdsdsdsdsd",
      date: "16 Sep 2024",
      time: "16:08",
    },
    // Ajoutez d'autres tickets ici
  ]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {tickets.map((ticket, index) => (
          <InvoiceDocument
            key={index}
            documentNumber={ticket.documentNumber}
            ticketNumber={ticket.ticketNumber}
            ticketTitle={ticket.ticketTitle}
            ticketService={ticket.ticketService}
            ticketStatus={ticket.ticketStatus}
            assignedTo={ticket.assignedTo}
            date={ticket.date}
            time={ticket.time}
          />
        ))}
      </ScrollView>
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
  },
});

export default Support;