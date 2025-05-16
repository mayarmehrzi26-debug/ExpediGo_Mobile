import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";
import CardCommande from "./components/CardCommande";
import CardEmballage from "./components/CardEmballage";
import { fetchMesLivraisons } from "./services/commandeService";
import { fetchEmballages } from "./services/EmballageService";

const MesCommandes: React.FC = () => {
  const [activeScreen] = useState("MesCommandes");
  const [commandes, setCommandes] = useState<any[]>([]);
  const [emballages, setEmballages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");
  const [activeTab, setActiveTab] = useState("livraisons"); // 'livraisons' ou 'emballages'
  const navigation = useNavigation();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mesCommandes, mesEmballages] = await Promise.all([
        fetchMesLivraisons(),
        fetchEmballages()
      ]);
      setCommandes(mesCommandes);
      setEmballages(mesEmballages);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommandes = commandes.filter((commande) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return commande.status === "En attente d'enlèvement";
    if (activeFilter === "À récupérer") return commande.status === "Picked";
    if (activeFilter === "En cours") return commande.status === "En cours de livraison";
    if (activeFilter === "Livrée") return commande.status === "Livré";
    return true;
  }).filter((commande) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      commande.clientEmail?.toLowerCase().includes(searchLower) ||
      commande.id?.includes(searchQuery) ||
      commande.origin?.toLowerCase().includes(searchLower) ||
      commande.destination?.toLowerCase().includes(searchLower)
    );
  });

  const filteredEmballages = emballages.filter((emballage) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emballage.userInfo.email?.toLowerCase().includes(searchLower) ||
      emballage.id?.includes(searchQuery) ||
      emballage.addressInfo.fullAddress?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator} />

      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'livraisons' && styles.activeTab]}
          onPress={() => setActiveTab('livraisons')}
        >
          <Text style={[styles.tabText, activeTab === 'livraisons' && styles.activeTabText]}>Livraisons</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'emballages' && styles.activeTab]}
          onPress={() => setActiveTab('emballages')}
        >
          <Text style={[styles.tabText, activeTab === 'emballages' && styles.activeTabText]}>Emballages</Text>
        </TouchableOpacity>
      </View>

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
        ) : activeTab === 'livraisons' ? (
          filteredCommandes.length === 0 ? (
            <Text style={styles.emptyText}>
              {commandes.length === 0 
                ? "Aucune commande de livraison assignée" 
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
                  onRefresh={loadData}
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1EEFF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#877DAB',
  },
  tabText: {
    color: '#877DAB',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 0,
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