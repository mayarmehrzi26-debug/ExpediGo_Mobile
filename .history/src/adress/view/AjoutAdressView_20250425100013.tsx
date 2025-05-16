import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AjoutAdressPresenter } from "../presenters/AdressPresenter";

interface AjoutAdressProps {
  navigation: any;
}

const AjoutAdressView: React.FC<AjoutAdressProps> = ({ navigation }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const presenter = new AjoutAdressPresenter({
    setLocation: (loc) => setLocation(loc),
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    showSuccess: (title, message, callback) => 
      Alert.alert(title, message, [{ text: "OK", onPress: callback }]),
    closeMapModal: () => setModalVisible(false),
    navigateBack: () => navigation.goBack(),
  });

  useEffect(() => {
    presenter.initialize();
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    presenter.handleMapPress({ latitude, longitude });
  };

  const handleSubmit = () => {
    if (!location) {
      Alert.alert("Erreur", "Veuillez sélectionner une position sur la carte");
      return;
    }
    
    presenter.submitAddress(location);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter une position</Text>
        <View style={styles.backButton} />
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Instructions */}
          <Text style={styles.instructions}>
            Sélectionnez une position sur la carte pour enregistrer les coordonnées GPS
          </Text>

          {/* Affichage des coordonnées */}
          {location && (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesTitle}>Position sélectionnée :</Text>
              <View style={styles.coordinatesRow}>
                <Ionicons name="locate" size={18} color="#54E598" />
                <Text style={styles.coordinatesText}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordinatesRow}>
                <Ionicons name="locate" size={18} color="#54E598" />
                <Text style={styles.coordinatesText}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          {/* Bouton pour ouvrir la carte */}
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="map" size={20} color="white" />
            <Text style={styles.mapButtonText}>
              {location ? "Modifier la position" : "Sélectionner sur la carte"}
            </Text>
          </TouchableOpacity>

          {/* Bouton d'enregistrement */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              !location && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit} 
            disabled={!location || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {location ? "Enregistrer la position" : "Sélectionnez d'abord une position"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de la carte */}
      <Modal 
        animationType="slide" 
        transparent={false} 
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionnez votre position</Text>
            <Text style={styles.modalSubtitle}>
              Appuyez sur la carte pour placer un marqueur
            </Text>
          </View>
          
          <MapView
            style={styles.modalMap}
            initialRegion={{
              latitude: location?.latitude || 33.8869, // Tunisie par défaut
              longitude: location?.longitude || 9.5375,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
            showsUserLocation={true}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={true}
          >
            {location && <Marker coordinate={location} />}
          </MapView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Valider la sélection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F7F7" 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  headerTitle: { 
    color: "#27251F", 
    fontSize: 18, 
    fontWeight: "800", 
    textAlign: "center", 
    flex: 1 
  },
  scrollContent: { 
    flex: 1 
  },
  content: { 
    padding: 20 
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center'
  },
  coordinatesContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  coordinatesText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#54E598',
    marginBottom: 20,
    elevation: 2
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10
  },
  submitButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#54E598',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5
  },
  modalMap: {
    flex: 1,
    width: '100%'
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  closeButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#54E598',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AjoutAdressView;