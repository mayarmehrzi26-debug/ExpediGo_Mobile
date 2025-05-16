import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { collection, getDocs,doc,getDoc, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
import NavBottomClient from "../../src/components/shared/NavBottomClient";
import FilterBar from "../../src/livraison/components/FilterBar";
import SearchBar from "../../src/livraison/components/SearchBar";
import CardCommande from "./components/CardCommande";

interface Commande {
  id: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  client: {
    name: string;
    phone: string;
  };
}

const CommandesClient: React.FC = () => {
  const [activeScreen] = useState("CommandesClient");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Toutes les commandes");
  const navigation = useNavigation();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        if (!currentUser) return;
        
        setLoading(true);
        const commandesCollection = collection(firebasestore, "livraisons");
        const q = query(
          commandesCollection, 
          where("client.id", "==", currentUser.uid),
          where("status", "!=", "Supprimée") // Exclure les commandes supprimées
        );
        
        const querySnapshot = await getDocs(q);
        const commandesList: Commande[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const [clientSnap, addressSnap] = await Promise.all([
            getDoc(doc(firebasestore, "clients", data.client)),
            getDoc(doc(firebasestore, "adresses", data.address))
          ]);

          const clientData = clientSnap.data() || {};
          const addressData = addressSnap.data() || {};

          commandesList.push({
            id: doc.id,
            origin: clientData.address || "Adresse inconnue",
            destination: addressData.address || "Adresse inconnue",
            status: data.status || "Non traité",
            date: data.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
            client: {
              name: clientData.name || "",
              phone: clientData.phone || ""
            }
          });
        }

        setCommandes(commandesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [currentUser]);

  const filteredCommandes = commandes.filter(commande => {
    // Filtre par recherche
    const matchesSearch = 
      commande.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre par statut
    const matchesFilter = 
      filter === "Toutes les commandes" || 
      commande.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (commandeId: string) => {
    navigation.navigate("CommandeDetails", { commandeId });
  };

  const statusFilters = [
    "Toutes les commandes",
    "Non traité",
    "En attente d'enlèvement",
    "Picked",
    "En cours de livraison",
    "Livré",
    "Retour",
    "Annulée"
  ];

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator} />

      <FilterBar 
        selectedFilter={filter}
        onFilterChange={setFilter}
        filterOptions={statusFilters}
      />

      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une commande..."
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44076a" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredCommandes.length > 0 ? (
            filteredCommandes.map(commande => (
              <TouchableOpacity 
                key={commande.id}
                onPress={() => handleViewDetails(commande.id)}
              >
                <CardCommande
                  commande={{
                    id: commande.id,
                    origin: commande.origin,
                    destination: commande.destination,
                    status: commande.status,
                    date: commande.date,
                    client: commande.client
                  }}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {commandes.length === 0 
                ? "Vous n'avez aucune commande" 
                : "Aucune commande ne correspond aux filtres"}
            </Text>
          )}
        </ScrollView>
      )}

      <NavBottomClient activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  separator: {
    height: 1,
    backgroundColor: "#44076a",
    marginVertical: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: "#666",
    fontSize: 16,
  },
});

export default CommandesClient;