import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("HomeScreen");
  const navigation = useNavigation();
  const [deliveries, setDeliveries] = useState<any[]>([]); // Stores deliveries data

  // Fetch Deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "livraisons"));
      const deliveriesList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Include the document ID
      }));
      setDeliveries(deliveriesList); // Set the deliveries in the state
    };

    fetchDeliveries();
  }, []);
  return (
    <View style={styles.container}>
<Header title="Pickups" showBackButton={true} />

      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>
       
      </ScrollView>

      {/* Barre de navigation en bas */}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
  },
});

export default Pickups;