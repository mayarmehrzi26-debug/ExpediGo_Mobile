import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ListeClientsPresenter } from "../presenters/ListeClientsPresenter";

interface ListeClientsProps {
  navigation: any;
}

const ListeClientsView: React.FC<ListeClientsProps> = ({ navigation }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const presenter = new ListeClientsPresenter({
    setClients: (clients) => setClients(clients),
    setLoading: (isLoading) => setLoading(isLoading),
    setRefreshing: (isRefreshing) => setRefreshing(isRefreshing),
    showError: (title, message) => Alert.alert(title, message),
    navigateToAdd: () => navigation.navigate('AjoutClient'),
    navigateToDetails: (clientId) => navigation.navigate('ClientDetails', { clientId }),
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      presenter.loadClients();
    });
    
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    presenter.refreshClients();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={() => presenter.navigateToDetails(item.id)}
    >
      <View style={styles.clientHeader}>
        <Ionicons name="person" size={24} color="#F06292" />
        <Text style={styles.clientName}>{item.name}</Text>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="call" size={16} color="#F06292" />
        <Text style={styles.clientText}>{item.phone}</Text>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="mail" size={16} color="#F06292" />
        <Text style={styles.clientText}>{item.email}</Text>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="location" size={16} color="#F06292" />
        <Text style={styles.clientText} numberOfLines={1}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liste des Clients</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => presenter.navigateToAdd()}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#877DAB" />
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color="#cccccc" />
          <Text style={styles.emptyText}>Aucun client enregistré</Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => presenter.navigateToAdd()}
          >
            <Text style={styles.addFirstButtonText}>Ajouter un client</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
    paddingTop:42,
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
    backgroundColor: "#877DAB",
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
    backgroundColor: "#877DAB",
  },
  addFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 10,
  },
  clientCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  clientText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
});

export default ListeClientsView;