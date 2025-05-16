import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import InvoiceDocument from "../components/InvoiceDocument";

interface TicketListProps {
  tickets: Array<any>; // Remplace par le type de ticket spécifique
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {tickets.map((ticket) => (
        <InvoiceDocument
          key={ticket.id}
          documentNumber={ticket.id}
          ticketNumber={ticket.bordereau || "N/A"}
          ticketTitle={ticket.titre || "N/A"}
          ticketService={ticket.service || "N/A"}
          ticketStatus={ticket.type || "N/A"}
          date={ticket.createdAt?.toDate().toLocaleDateString() || "N/A"}
          time={ticket.createdAt?.toDate().toLocaleTimeString() || "N/A"}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 30,
    marginRight: 22,
  },
});

export default TicketList;
