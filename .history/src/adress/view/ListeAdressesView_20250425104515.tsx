import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { ListeAdressesPresenter } from "../presenters/ListeAdressesPresenter";

interface ListeAdressesProps {
  navigation: any;
}

const ListeAdressesView: React.FC<ListeAdressesProps> = ({ navigation }) => {
  const [adresses, setAdresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const presenter = new ListeAdressesPresenter({
    setAdresses: (ads) => setAdresses(ads),
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    navigateToAdd: () => navigation.navigate('AjoutAdress'),
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      presenter.loadAdresses();
    });
    
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: Address }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Ionicons name="location" size={24} color="#54E598" />
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
      <Text style={styles.itemAddress}>{item.addressText}</Text>
      <View style={styles.coordinatesRow}>
        <Text style={styles.coordinateText}>
          Lat: {item.latitude.toFixed(4)}
        </Text>
        <Text style={styles.coordinateText}>
          Long: {item.longitude.toFixed(4)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Adresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => presenter.navigateToAdd()}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Liste des adresses */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#54E598" />
        </View>
      ) : adresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-off" size={50} color="#cccccc" />
          <Text style={styles.emptyText}>Aucune adresse enregistrée</Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => presenter.navigateToAdd()}
          >
            <Text style={styles.addFirstButtonText}>Ajouter une adresse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={adresses}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  addFirstButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#54E598",
  },
  addFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 10,
  },
  itemContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  itemAddress: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  coordinatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordinateText: {
    fontSize: 12,
    color: "#777",
  },
});

export default ListeAdressesView;