import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";
import CardCommande from "./components/CardCommande";
import CardEmballage from "./components/CardEmballage";
import { fetchMesLivraisons } from "./services/commandeService";
import { fetchUserEmballages } from "./services/EmballageService";

const MesCommandes: React.FC = () => {
  const [activeScreen] = useState("MesCommandes");
  const [commandes, setCommandes] = useState<any[]>([]);
  const [emballages, setEmballages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLivraisonFilter, setActiveLivraisonFilter] = useState("Toutes les commandes");
  const [activeEmballageFilter, setActiveEmballageFilter] = useState("Tous les emballages");
  const [activeTab, setActiveTab] = useState("livraisons"); // 'livraisons' ou 'emballages'
  const navigation = useNavigation();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mesCommandes, mesEmballages] = await Promise.all([
        fetchMesLivraisons(),
        fetchUserEmballages()
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

  // Filtres pour les livraisons
  const filteredCommandes = commandes.filter((commande) => {
    if (activeLivraisonFilter === "Toutes les commandes") return true;
    if (activeLivraisonFilter === "À livrer") return commande.status === "En attente d'enlèvement";
    if (activeLivraisonFilter === "À récupérer") return commande.status === "Picked";
    if (activeLivraisonFilter === "En cours") return commande.status === "En cours de livraison";
    if (activeLivraisonFilter === "Livrée") return commande.status === "Livré";
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

  // Filtres pour les emballages
  const filteredEmballages = emballages.filter((emballage) => {
    if (activeEmballageFilter === "Tous les emballages") return true;
    if (activeEmballageFilter === "Accepté") return emballage.status === "Accepté";
    if (activeEmballageFilter === "En cours") return emballage.status === "En cours de livraison";
    if (activeEmballageFilter === "Livré") return emballage.status === "Livré";
    if (activeEmballageFilter === "Retour") return emballage.status === "Retour";
    return true;
  }).filter((emballage) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emballage.userInfo.email?.toLowerCase().includes(searchLower) ||
      emballage.id?.includes(searchQuery) ||
      emballage.addressInfo.fullAddress?.toLowerCase().includes(searchLower)
    );
  });

  // Options de filtre pour les livraisons
  const livraisonFilterOptions = [
    "Toutes les commandes",
    "À livrer",
    "À récupérer",
    "En cours",
    "Livrée"
  ];

  // Options de filtre pour les emballages
  const emballageFilterOptions = [
    "Tous les emballages",
    "Accepté",
    "En cours",
    "Livré",
    "Retour"
  ];

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

      {/* Filtres selon l'onglet actif */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(activeTab === 'livraisons' ? livraisonFilterOptions : emballageFilterOptions).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              (activeTab === 'livraisons' 
                ? activeLivraisonFilter === filter 
                : activeEmballageFilter === filter) && styles.activeFilter
            ]}
            onPress={() => {
              if (activeTab === 'livraisons') {
                setActiveLivraisonFilter(filter);
              } else {
                setActiveEmballageFilter(filter);
              }
            }}
          >
            <Text style={[
              styles.filterText,
              (activeTab === 'livraisons' 
                ? activeLivraisonFilter === filter 
                : activeEmballageFilter === filter) && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          )
        ) : (
          filteredEmballages.length === 0 ? (
            <Text style={styles.emptyText}>
              {emballages.length === 0 
                ? "Aucune commande d'emballage disponible" 
                : "Aucun emballage ne correspond aux filtres"}
            </Text>
          ) : (
            filteredEmballages.map((emballage) => (
              <CardEmballage
                key={emballage.id}
                emballage={emballage}
                onRefresh={loadData}
              />
            ))
          )
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
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  activeFilter: {
    backgroundColor: '#877DAB',
    borderColor: '#44076a',
  },
  filterText: {
    color: '#666',
  },
  activeFilterText: {
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