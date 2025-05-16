import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button
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
    showConfirmation: (title, message, onConfirm) => 
      Alert.alert(title, message, [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: onConfirm }
      ]),
    showSuccess: (message) => Alert.alert("Succès", message),
  }, navigation);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      presenter.loadClients();
    });
    
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    presenter.refreshClients();
  };

  const handleEditClient = (clientId: string) => {
    presenter.navigateToEdit(clientId);
  };

  const handleDeleteClient = (clientId: string) => {
    presenter.showConfirmation(
      "Supprimer le client",
      "Êtes-vous sûr de vouloir supprimer ce client ?",
      () => presenter.deleteClient(clientId)
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={() => presenter.navigateToDetails(item.id)}
    >
      <View style={styles.clientHeader}>
        <Ionicons name="person" size={24} color="#F06292" />
        <Text style={styles.clientName}>{item.name}</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            onPress={() => handleEditClient(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="create" size={20} color="#877DAB" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDeleteClient(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="call" size={16} color="#877DAB" />
        <Text style={styles.clientText}>{item.phone}</Text>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="mail" size={16} color="#877DAB" />
        <Text style={styles.clientText}>{item.email}</Text>
      </View>
      
      <View style={styles.clientInfo}>
        <Ionicons name="location" size={16} color="#877DAB" />
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

// ... (les styles restent les mêmes)