import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert,
    ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
const PickupAddresses: React.FC = () => {
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onSnapshot(collection(firebasestore, "adresses"), (snapshot) => {
        const fetchedAddresses = snapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
  
        // Trier par ID numérique
        setAddresses(fetchedAddresses.sort((a, b) => a.id - b.id));
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    // Ajouter une adresse
    const addAddress = () => {
        // Navigate to the AjoutAdress page
        navigation.navigate("AjoutAdress");
      };
      
  
    const deleteAddress = async (docId: string) => {
      try {
        await deleteDoc(doc(firebasestore, "adresses", docId));
      } catch (error) {
        console.error("Erreur de suppression :", error);
      }
    };
  
    const confirmDelete = (docId: string) => {
      Alert.alert(
        "Supprimer",
        "Voulez-vous vraiment supprimer cette adresse ?",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Supprimer", onPress: () => deleteAddress(docId), style: "destructive" },
        ]
      );
    };
  
    return (
      <View style={styles.container}>
        <Header title="Adresses de pickup" showBackButton={true} />
  
        {loading ? (
          <ActivityIndicator size="large" color="#54E598" style={{ marginTop: 20 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.menuContainer}>
            {addresses.map((item) => (
              <View key={item.docId} style={styles.card}>
                <Text style={styles.cardTitle}>Adresse PickUp {item.id}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Zone</Text>
                  <Text style={styles.value}>{item.zone}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Adresse</Text>
                  <Text style={styles.value}>{item.address}</Text>
                </View>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.buttonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.docId)}>
                    <Text style={styles.buttonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
  
        <TouchableOpacity style={styles.floatingButton} onPress={addAddress}>
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  menuContainer: { paddingHorizontal: 20, paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { fontSize: 14, fontWeight: "bold", color: "#555" },
  value: { fontSize: 14, color: "#333" },
  buttonsContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  editButton: {
    backgroundColor: "#877DAB",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#877DAB",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default PickupAddresses;
