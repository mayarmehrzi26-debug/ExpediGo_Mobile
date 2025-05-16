import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";
import Header from "../src/components/Header";
import InvoiceDocument from "../src/components/InvoiceDocument";
import NavBottom from "../src/components/NavBottom";

const Support: React.FC = () => {
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState("Support");
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    try {
      const querySnapshot = await getDocs(collection(firebasestore, "tickets"));
      const ticketsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTickets(ticketsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets :", error);
    }
  };

  useEffect(() => {
    fetchTickets(); // Fetch tickets when the component mounts
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Tickets" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <InvoiceDocument tickets={tickets} /> {/* Pass tickets to InvoiceDocument */}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate("AddTicket", { refreshTickets: fetchTickets }); // Pass fetchTickets function
        }}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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