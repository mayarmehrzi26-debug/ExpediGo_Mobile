import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  clientName: string;
  clientPhone: string;
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
        
        // 1. Trouver le client correspondant à l'utilisateur connecté
        const clientsQuery = query(
          collection(firebasestore, "clients"),
          where("id", "==", currentUser.uid)
        );
        
        const clientsSnapshot = await getDocs(clientsQuery);
        if (clientsSnapshot.empty) {
          console.log("Aucun client trouvé pour cet utilisateur");
          return;
        }

        const clientId = clientsSnapshot.docs[0].id;
        const clientData = clientsSnapshot.docs[0].data();

        // 2. Récupérer les commandes de ce client
        const commandesQuery = query(
          collection(firebasestore, "livraisons"),
          where("client", "==", clientId)
        );
        
        const commandesSnapshot = await getDocs(commandesQuery);
        const commandesList: Commande[] = [];

        commandesSnapshot.forEach((doc) => {
          const data = doc.data();
          // On filtre manuellement les commandes supprimées
          if (data.status !== "Supprimée") {
            commandesList.push({
              id: doc.id,
              origin: data.origin || clientData.address || "Adresse inconnue",
              destination: data.destination || "Adresse inconnue",
              status: data.status || "Non traité",
              date: data.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
              clientName: clientData.name || "",
              clientPhone: clientData.phone || ""
            });
          }
        });

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
    const matchesSearch = 
      commande.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === "Toutes les commandes" || 
      commande.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (commandeId: string) => {
    navigation.navigate("CommandeDetailsClient", { commandeId });
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
                    client: {
                      name: commande.clientName,
                      phone: commande.clientPhone
                    }
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