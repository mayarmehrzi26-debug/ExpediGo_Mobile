import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDocs, updateDoc,query,where} from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity,ScrollView, StyleSheet, Text, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/shared/NavBottom";
import FilterBar from "../../src/livraison/components/FilterBar";
import SearchBar from "../../src/livraison/components/SearchBar";
import FileExplorer from "../components/FileExplorer";
import DeliveryCard from "../livraison/components/DeliveryCard";
import { LivraisonModel } from "../livraison/models/Livraison";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const Livraison: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Livraisons");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: boolean }>({});
  const [filter, setFilter] = useState("Toutes les livraisons");
  const navigation = useNavigation();
  const [presenter] = useState(new LivraisonModel());

  const auth = getAuth();
  const currentUser = auth.currentUser;
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        if (!currentUser) return;
        
        const deliveriesCollection = collection(firebasestore, "livraisons");
        // Ajoutez une condition where pour filtrer par createdBy
        const q = query(deliveriesCollection, where("createdBy", "==", currentUser.uid));
        const deliverySnapshot = await getDocs(q);
        const deliveryList = deliverySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveryList);
      } catch (error) {
        console.error("Erreur lors de la récupération des livraisons:", error);
      }
    };

    fetchDeliveries();
  }, [currentUser]);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch = 
      delivery.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === "Toutes les livraisons" || 
      delivery.status === filter ||
      (filter === "Échange" && delivery.isExchange);

    return matchesSearch && matchesFilter;
  });

  const toggleSelectAll = useCallback(() => {
    setSelectedCards(prev => {
      // Vérifier si toutes les livraisons filtrées sont déjà sélectionnées
      const allCurrentlySelected = filteredDeliveries.every(d => prev[d.id]);
      
      if (allCurrentlySelected) {
        // Désélectionner toutes les livraisons
        const newSelection = {...prev};
        filteredDeliveries.forEach(d => {
          delete newSelection[d.id];
        });
        return newSelection;
      } else {
        // Sélectionner toutes les livraisons filtrées
        const newSelection = {...prev};
        filteredDeliveries.forEach(d => {
          newSelection[d.id] = true;
        });
        return newSelection;
      }
    });
  }, [filteredDeliveries]);

  const toggleCardSelection = (id: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedDeliveriesIds = Object.keys(selectedCards).filter(id => selectedCards[id]);
  const allSelected = selectedDeliveriesIds.length > 0 && 
                     filteredDeliveries.every(d => selectedCards[d.id]);

  const handleViewDetails = (id: string) => {
    navigation.navigate("PackageDetails", { deliveryId: id });
  };

  const handleEditPickup = (id: string) => {
    navigation.navigate("EditLivraison", { deliveryId: id });
  };

  const handleCancelDelivery = async (id: string) => {
    try {
      const deliveryRef = doc(firebasestore, "livraisons", id);
      await updateDoc(deliveryRef, { status: "Annulée" });

      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.id === id ? { ...delivery, status: "Annulée" } : delivery
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'annulation de la livraison:", error);
    }
  };

  const canModifyOrCancel = (status: string): boolean => {
    return status === "Non traité" || status === "En attente d'enlèvement";
  };

  return (
    <View style={styles.container}>
      <Header title="Livraisons" showBackButton={true} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("EmballageList")}>
          <Ionicons name="time-outline" size={24} color="black" style={styles.headerImage} />
        </TouchableOpacity>
      <View style={styles.separator1} />

      <FilterBar 
        selectedFilter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          "Toutes les livraisons", "Non traité", "En attente d'enlèvement",
          "Picked", "Annulée", "En cours de livraison", "Livré", "Retour", "Échange"
        ]}
      />
<View style={styles.container1}>
  <View style={styles.fileExplorerContainer}>
    <FileExplorer 
      selectedDeliveries={selectedDeliveriesIds}
      deliveries={filteredDeliveries}
      toggleSelectAll={toggleSelectAll}
      allSelected={allSelected}
    />
  </View>
  <View style={styles.searchBarContainer}>
    <SearchBar 
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Rechercher une livraison..."
    />
  </View>
</View>
      
        
      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              id={delivery.id}
              client={delivery.client}
              address={delivery.address}
              status={delivery.status}
              date={delivery.createdAt?.toDate?.() || new Date()}
              isSelected={!!selectedCards[delivery.id]}
              onToggleSelection={toggleCardSelection}
              onViewDetails={() => handleViewDetails(delivery.id)}
              onEditPickup={() => handleEditPickup(delivery.id)}
              onCancel={() => handleCancelDelivery(delivery.id)}
              showEditButton={canModifyOrCancel(delivery.status)}     
              showCancelButton={canModifyOrCancel(delivery.status)} 
            />
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  fileExplorerContainer: {
    flex: 1,
    marginRight: 100,
  },
  searchBarContainer: {
    flex: 3,
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
    padding: 20,
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 20,
  },
  separator1: {
    height: 1,
    backgroundColor: "#877DAB",
    marginVertical: 8,
    marginBottom: 22,
  },
});

export default Livraison;