// AjoutAdressView.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AjoutAdressPresenter } from "../presenters/AdressPresenter";

interface AjoutAdressProps {
  navigation: any;
}

const AjoutAdressView: React.FC<AjoutAdressProps> = ({ navigation }) => {
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const presenter = new AjoutAdressPresenter({
    setLocation: (loc) => setLocation(loc),
    setZone: (zone) => setZone(zone),
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    showSuccess: (title, message, callback) => 
      Alert.alert(title, message, [{ text: "OK", onPress: callback }]),
    closeMapModal: () => setModalVisible(false),
    navigateBack: () => navigation.goBack(),
  });

  React.useEffect(() => {
    presenter.initialize();
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    presenter.handleMapPress({ latitude, longitude });
  };

  const handleSubmit = () => {
    if (!location) return;
    
    presenter.submitAddress({
      zone,
      address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter adresse de pickup</Text>
        <View style={styles.backButton} />
      </View>

      {/* Form Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Zone Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Zone</Text>
            <View style={styles.zoneContainer}>
              <TextInput
                style={styles.input}
                placeholder="Veuillez entrer la zone"
                placeholderTextColor="#A7A9B7"
                value={zone}
                onChangeText={setZone}
                editable={false}
              />
              <TouchableOpacity style={styles.mapIcon} onPress={() => setModalVisible(true)}>
                <Ionicons name="map" size={24} color="#54E598" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Address Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Entrez l'adresse"
              placeholderTextColor="#A7A9B7"
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter l'adresse</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez une zone</Text>
          <MapView
            style={styles.modalMap}
            initialRegion={{
              latitude: location?.latitude || 33.8869,
              longitude: location?.longitude || 9.5375,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onPress={handleMapPress}
            showsUserLocation={true}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={false}
          >
            {location && <Marker coordinate={location} />}
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// ... styles remain the same as in your original code ...

export default AjoutAdressView;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 61, paddingBottom: 24 },
  backButton: { width: 46, height: 47, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#27251F", fontSize: 16, fontWeight: "800", textAlign: "center", flex: 1 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  formGroup: { marginBottom: 24 },
  label: { color: "#27251F", fontSize: 13, fontWeight: "500", marginBottom: 8 },
  input: { height: 52, paddingHorizontal: 11, borderRadius: 8, borderWidth: 1, borderColor: "#A7A9B7", fontSize: 14, color: "#27251F", flex: 1 },
  zoneContainer: { flexDirection: "row", alignItems: "center" },
  mapIcon: { position: "absolute", right: 10, padding: 10 },
  textArea: { height: 100, textAlignVertical: "top" },
  submitButton: { width: 224, height: 37, borderRadius: 5.4, backgroundColor: "#54E598", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 },
  submitButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 },
  modalMap: { width: "100%", height: 400 },
  closeButton: { marginTop: 20, backgroundColor: "#54E598", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});