import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");
  const [activeEmballageFilter, setActiveEmballageFilter] = useState("Tous les emballages");
  const [activeTab, setActiveTab] = useState("livraisons"); // 'livraisons' ou 'emballages'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigation = useNavigation();

  const commandeFilters = [
    "Toutes les commandes",
    "En attente d'enlèvement",
    "En cours de pickup",
    "Picked",
    "En cours de livraison",
    "Livré",
    "Echange"
  ];

  const emballageFilters = [
    "Tous les emballages",
    "En attente",
    "Confirmé",
    "En cours",
    "Terminé"
  ];

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
    if (activeEmballageFilter === "Tous les emballages") return true;
    if (activeEmballageFilter === "En attente") return emballage.status === "En attente";
    if (activeEmballageFilter === "Confirmé") return emballage.status === "Confirmé";
    if (activeEmballageFilter === "En cours") return emballage.status === "En cours";
    if (activeEmballageFilter === "Terminé") return emballage.status === "Terminé";
    return true;
  }).filter((emballage) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emballage.userInfo.email?.toLowerCase().includes(searchLower) ||
      emballage.id?.includes(searchQuery) ||
      emballage.addressInfo.fullAddress?.toLowerCase().includes(searchLower)
    );
  });

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer par statut</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <AntDesign name="close" size={24} color="#44076a" />
            </TouchableOpacity>
          </View>
          
          {activeTab === 'livraisons' ? (
            commandeFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  activeFilter === filter && styles.selectedFilterOption
                ]}
                onPress={() => {
                  setActiveFilter(filter);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  activeFilter === filter && styles.selectedFilterOptionText
                ]}>
                  {filter}
                </Text>
                {activeFilter === filter && (
                  <AntDesign name="check" size={20} color="#44076a" />
                )}
              </TouchableOpacity>
            ))
          ) : (
            emballageFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  activeEmballageFilter === filter && styles.selectedFilterOption
                ]}
                onPress={() => {
                  setActiveEmballageFilter(filter);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  activeEmballageFilter === filter && styles.selectedFilterOptionText
                ]}>
                  {filter}
                </Text>
                {activeEmballageFilter === filter && (
                  <AntDesign name="check" size={20} color="#44076a" />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </Modal>
  );

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

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <AntDesign name="filter" size={20} color="#44076a" />
          <Text style={styles.filterButtonText}>
            {activeTab === 'livraisons' ? activeFilter : activeEmballageFilter}
          </Text>
        </TouchableOpacity>
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

      {renderFilterModal()}
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
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterButtonText: {
    marginLeft: 8,
    color: '#44076a',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedFilterOption: {
    backgroundColor: '#F1EEFF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#44076a',
    fontWeight: 'bold',
  },
});

export default MesCommandes;