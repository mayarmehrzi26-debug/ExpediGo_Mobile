import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import InvoiceDocument from "../src/components/InvoiceDocument";
import NavBottom from "../src/components/NavBottom";

const Support: React.FC = ({ navigation }) => {
  const [tickets, setTickets] = useState([]); // État pour stocker les tickets
  const [activeScreen, setActiveScreen] = useState("Support");

  // Fonction pour récupérer les tickets depuis Firestore
  const fetchTickets = async () => {
    try {
      const querySnapshot = await getDocs(collection(firebasestore, "tickets"));
      const ticketsData = querySnapshot.docs.map((doc) => ({
        id: doc.data().id, // Utiliser l'ID numérique
        ...doc.data(),
      }));
      setTickets(ticketsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets :", error);
    }
  };

  // Utiliser useEffect pour récupérer les tickets au chargement du composant
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fonction pour rafraîchir la liste des tickets
  const refreshTickets = () => {
    fetchTickets();
  };

  return (
    <View style={styles.container}>
      <Header title="Tickets" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        {tickets.map((ticket) => (
          <InvoiceDocument
            key={ticket.id}
            documentNumber={ticket.id} // Passer l'ID numérique
            ticketNumber={ticket.bordereau || "N/A"} // Bordereau
            ticketTitle={ticket.titre || "N/A"} // Titre
            ticketService={ticket.service || "N/A"} // Service
            ticketStatus={ticket.type || "N/A"} // Type de ticket
            date={ticket.createdAt?.toDate().toLocaleDateString() || "N/A"} // Date de création
            time={ticket.createdAt?.toDate().toLocaleTimeString() || "N/A"} // Heure de création
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddTicket", { refreshTickets })}
      >
        <Ionicons name={"add"} size={54} color="white" />
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
    gap: 20, // Espace entre les éléments enfants

  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#54E598",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginLeft: 350,
  },
});

export default Support;