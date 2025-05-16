import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface Commande {
  id: string;
  date: string;
  quantite: number;
  taille: string;
  pu: number;
  pt: number;
  etat: string;
  dateAction: string;
}

interface EmballageListProps {
  navigation: any;
}

const EmballageList: React.FC<EmballageListProps> = ({ navigation }) => {
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    const fetchCommandes = async () => {
      const commandesCollection = collection(firebasestore, "orders");
      const commandesSnapshot = await getDocs(commandesCollection);
      const commandesList = commandesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Commande[];

      console.log("Commandes récupérées:", commandesList); // Vérifiez les données ici
      setCommandes(commandesList);
    };

    fetchCommandes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Créé le</Text>
          <Text style={styles.tableHeaderText}>Quantité</Text>
          <Text style={styles.tableHeaderText}>Taille</Text>
          <Text style={styles.tableHeaderText}>PU</Text>
          <Text style={styles.tableHeaderText}>PT</Text>
          <Text style={styles.tableHeaderText}>État</Text>
          <Text style={styles.tableHeaderText}>Date d'action</Text>
        </View>

        {commandes.map((commande) => (
          <View key={commande.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{commande.date || "N/A"}</Text>
            <Text style={styles.tableCell}>{commande.quantite || "N/A"}</Text>
            <Text style={styles.tableCell}>{commande.taille || "N/A"}</Text>
            <Text style={styles.tableCell}>{commande.pu !== undefined ? `${commande.pu} Dinars` : "N/A"}</Text>
            <Text style={styles.tableCell}>{commande.pt !== undefined ? `${commande.pt} Dinars` : "N/A"}</Text>
            <Text style={[styles.tableCell, styles.statusCell(commande.etat)]}>{commande.etat || "N/A"}</Text>
            <Text style={styles.tableCell}>{commande.dateAction || "N/A"}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="cube-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Pickups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="bicycle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name={"add"} size={54} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="help-circle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="person-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 51,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontFamily: "Avenir",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EAEAEA",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#27251F",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D4D4D4",
  },
  tableCell: {
    color: "#27251F",
  },
  statusCell: (etat: string) => ({
    color: etat === "Livré" ? "green" : etat === "Refusée" ? "red" : "orange",
  }),
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  bottomNavItem: {
    alignItems: "center",
    width: 38,
    height: 43,
  },
  bottomNavText: {
    marginTop: 4,
    fontSize: 7,
    color: "#27251F",
    fontWeight: "800",
    textAlign: "center",
  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
});

export default EmballageList;