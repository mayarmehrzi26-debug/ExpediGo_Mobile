import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";
import CardCommande from "./components/CardCommande";
import { fetchMesLivraisons } from "./services/commandeService";

const MesCommandes: React.FC = () => {
  const [activeScreen] = useState("MesCommandes");
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const mesCommandes = await fetchMesLivraisons();
      console.log("Commandes chargées:", mesCommandes);
      setCommandes(mesCommandes);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  const filteredCommandes = commandes
  .filter((commande) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return commande.status === "En attente d'enlèvement";
    if (activeFilter === "À récupérer") return commande.status === "Picked";
    if (activeFilter === "En cours") return commande.status === "En cours de livraison";
    if (activeFilter === "Livrée") return commande.status === "Livré";
    return true;
  })
    .filter((commande) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        commande.clientEmail?.toLowerCase().includes(searchLower) ||
        commande.id?.includes(searchQuery) ||
        commande.origin?.toLowerCase().includes(searchLower) ||
        commande.destination?.toLowerCase().includes(searchLower)
      );
    });

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color="#44076a" />
        ) : filteredCommandes.length === 0 ? (
          <Text style={styles.emptyText}>
            {commandes.length === 0 
              ? "Aucune commande assignée" 
              : "Aucune commande ne correspond aux filtres"}
          </Text>
        ) : (
          filteredCommandes.map((commande) => (
            <TouchableOpacity 
          key={commande.id} 
          onPress={() => navigation.navigate('CommandeDetails', { commande })}
        >
          <CardCommande
            commande={commande}
            onRefresh={loadCommandes}
          />
        </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <NavBottomLiv activeScreen={activeScreen} />
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
    padding: 16,
    paddingTop: 8,
  },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: "#666",
    fontSize: 16,
  },
});

export default MesCommandes;