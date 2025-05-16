import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";
import CardCommande from "./components/CardCommande"; // Importez votre composant CardCommande
import { fetchMesLivraisons } from "./services/commandeService"; // Importez votre service
const MesCommandes: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("MesCommandes");
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");
  const navigation = useNavigation();

  // Fonction pour charger les commandes
  const loadCommandes = async () => {
    setLoading(true);
    try {
      const mesCommandes = await fetchMesLivraisons();
      setCommandes(mesCommandes);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les commandes au montage du composant
  useEffect(() => {
    loadCommandes();
  }, []);

  // Fonction pour rafraîchir les commandes
  const handleRefresh = () => {
    loadCommandes();
  };

  const filteredCommandes = commandes.filter((commande) => {
    // Filtre par statut
    if (activeFilter === "À livrer") return commande.status === "En attente d'enlèvement";
    if (activeFilter === "En cours de livraison") return commande.status === "En cours";
    if (activeFilter === "Livrée") return commande.status === "Traité";
    return true;
  }).filter(commande => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (commande.clientEmail?.toLowerCase().includes(searchLower)) ||
      (commande.id?.toString().includes(searchQuery)) ||
      (commande.origin?.toLowerCase().includes(searchLower)) ||
      (commande.destination?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      {/* Barre de filtres */}
     

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une commande..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contenu principal */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#44076a" style={styles.loader} />
        ) : filteredCommandes.length === 0 ? (
          <Text style={styles.emptyText}>Aucune commande trouvée</Text>
        ) : (
          filteredCommandes.map((commande) => (
            <CardCommande
              key={commande.id}
              commande={commande}
              onRefresh={handleRefresh}
            />
          ))
        )}
      </ScrollView>

      <NavBottomLiv activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
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
    paddingTop: 0,
    padding: 20,
  },
  separator1: {
    height: 1,
    backgroundColor: "#44076a",
    marginVertical: 8,
    marginBottom: 22,
  },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  loader: {
    marginTop: 50,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 16,
  },
});

export default MesCommandes;