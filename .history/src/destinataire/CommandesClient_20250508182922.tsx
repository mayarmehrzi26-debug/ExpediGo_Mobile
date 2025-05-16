import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../../src/components/Header";
import NavBottomClient from "../../src/components/shared/NavBottomClient";
import FilterBar from "../../src/livraison/components/FilterBar";
import SearchBar from "../../src/livraison/components/SearchBar";
import { CommandesPresenter } from "../livraison/presenters/CommandesPresenter";
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
  const [presenter] = useState(new CommandesPresenter());

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        if (!currentUser) {
          setCommandes([]);
          return;
        }
        
        setLoading(true);
        const fetchedCommandes = await presenter.fetchCommandes(currentUser.uid);
        console.log("Commandes récupérées:", fetchedCommandes); // Log de débogage
        setCommandes(fetchedCommandes);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        setCommandes([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommandes();
  }, [currentUser, presenter]);

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = 
      commande.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commande.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
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