import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { firebasestore } from "../FirebaseConfig";

interface AjoutAdressProps {
  navigation: any;
}

const AjoutAdress: React.FC<AjoutAdressProps> = ({ navigation }) => {
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'application a besoin d'accéder à votre localisation.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const city = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
      setZone(city);
    })();
  }, []);

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        return address.city || address.region || "Localisation inconnue";
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
    }
    return "Localisation inconnue";
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });

    const city = await getAddressFromCoords(latitude, longitude);
    setZone(city);
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!zone || !address || !location) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs et choisir une zone sur la carte.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(firebasestore, "clients"), {
        zone,
        address,
        latitude: location.latitude,
        longitude: location.longitude,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Adresse ajoutée avec succès", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'adresse:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout de l'adresse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter adresse de pickup</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Zone Input avec Mini Map */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Zone</Text>
            <View style={styles.zoneContainer}>
              <TextInput
                style={styles.input}
                placeholder="Veuillez entrer la zone"
                placeholderTextColor="#A7A9B7"
                value={zone}
                onChangeText={setZone}
                editable={false} // Empêcher la saisie manuelle
              />
              <TouchableOpacity style={styles.mapIcon} onPress={() => setModalVisible(true)}>
                <Ionicons name="map" size={24} color="#54E598" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Adresse Input */}
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

          {/* Bouton Soumettre */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter l'adresse</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal pour sélection sur la carte */}
      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez une zone</Text>
          <MapView
            style={styles.modalMap}
            initialRegion={{
              latitude: location?.latitude || 37.78825,
              longitude: location?.longitude || -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
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
  mapIcon: { marginLeft: 10, padding: 10 },
  textArea: { height: 100, textAlignVertical: "top" },
  submitButton: { width: 224, height: 37, borderRadius: 5.4, backgroundColor: "#54E598", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 },
  submitButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 },
  modalMap: { width: "100%", height: 400 },
  closeButton: { marginTop: 20, backgroundColor: "#54E598", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AjoutAdress;
