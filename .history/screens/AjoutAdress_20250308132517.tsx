import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig";

const PickupAdresses = ({ navigation }: any) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firebasestore, "adresses"), (snapshot) => {
      const fetchedAddresses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddresses(fetchedAddresses);
      setLoading(false);
    });

    return () => unsubscribe(); // Nettoyage de l'écouteur Firestore
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresses de Pickup</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#54E598" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.addressItem}>
              <Text style={styles.zoneText}>{item.zone}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 61, paddingBottom: 24 },
  backButton: { width: 46, height: 47, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#27251F", fontSize: 16, fontWeight: "800", textAlign: "center", flex: 1 },
  addressItem: { backgroundColor: "white", padding: 15, marginVertical: 8, marginHorizontal: 20, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  zoneText: { fontSize: 16, fontWeight: "bold", color: "#27251F" },
  addressText: { fontSize: 14, color: "#A7A9B7", marginTop: 5 },
});

export default PickupAdresses;
