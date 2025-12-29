import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  showSuccess: (title, message) => { // Retirez le callback
    Alert.alert(title, message);
    // Réinitialisez le formulaire si nécessaire
    setClientName("");
    setPhoneNumber("");
    setEmail("");
    setLocation(null);
  },
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