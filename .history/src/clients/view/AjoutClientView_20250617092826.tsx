import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AjoutClientPresenter } from "../presenters/AjoutClientPresenter";
import { ListeClientsPresenter } from "../presenters/ListeClientsPresenter";

interface AjoutClientProps {
  navigation: any;
}

const AjoutClientView: React.FC<AjoutClientProps> = ({ navigation }) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const presenter = new AjoutClientPresenter({
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    showSuccess: (title, message, callback) => 
      Alert.alert(title, message, [{ text: "OK", onPress: callback }]),
    navigateBack: () => navigation.goBack(),
  });

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const fullAddress = [
        address.street,
        address.city,
        address.region,
        address.postalCode,
        address.country
      ].filter(Boolean).join(", ");

      setLocation({
        latitude,
        longitude,
        address: fullAddress || "Adresse inconnue"
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer l'adresse");
    }
  };

  const handleSubmit = () => {
    if (!clientName || !phoneNumber || !email || !location) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs et sélectionner une adresse");
      return;
    }

    presenter.handleSubmit({
      name: clientName,
      phone: phoneNumber,
      email,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un client</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le nom et prénom"
              placeholderTextColor="#A7A9B7"
              value={clientName}
              onChangeText={setClientName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le numéro"
              placeholderTextColor="#A7A9B7"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez l'email"
              placeholderTextColor="#A7A9B7"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TouchableOpacity 
              style={styles.addressSelector}
              onPress={() => setModalVisible(true)}
            >
              {location ? (
                <Text style={styles.addressText}>{location.address}</Text>
              ) : (
                <Text style={styles.placeholderText}>Sélectionner sur la carte</Text>
              )}
              <Ionicons name="map" size={20} color="#877DAB" />
            </TouchableOpacity>

            {location && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinateText}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton, 
              loading && styles.disabledButton
            ]} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Ajouter le client</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionnez l'adresse</Text>
            <Text style={styles.modalSubtitle}>Appuyez sur la carte pour choisir</Text>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 36.8065,
              longitude: location?.longitude || 10.1815,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
            showsUserLocation={true}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
              />
            )}
          </MapView>

          <TouchableOpacity
            style={styles.closeMapButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeMapButtonText}>Valider la sélection</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
    fontSize: 16,
  },
  addressSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#A7A9B7",
  },
  coordinatesContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  coordinateText: {
    fontSize: 12,
    color: "#666",
  },
  submitButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#877DAB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  closeMapButton: {
    padding: 15,
    backgroundColor: "#877DAB",
    alignItems: "center",
  },
  closeMapButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AjoutClientView;
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
          <Text style={styles.emptyText}>Vous n'avez pas encore ajouté de clients</Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => presenter.navigateToAdd()}
          >
            <Text style={styles.addFirstButtonText}>Ajouter votre premier client</Text>
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
    paddingTop: 42,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
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

export default ListeClientsView;i