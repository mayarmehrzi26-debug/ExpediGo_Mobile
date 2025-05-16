import React from "react";
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
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

interface AjoutAdressViewProps {
  zone: string;
  address: string;
  location: { latitude: number; longitude: number } | null;
  loading: boolean;
  modalVisible: boolean;
  onZoneChange: (text: string) => void;
  onAddressChange: (text: string) => void;
  onMapPress: (event: any) => void;
  onSubmit: () => void;
  onModalToggle: (visible: boolean) => void;
  onBackPress: () => void;
}

export const AjoutAdressView: React.FC<AjoutAdressViewProps> = ({
  zone,
  address,
  location,
  loading,
  modalVisible,
  onZoneChange,
  onAddressChange,
  onMapPress,
  onSubmit,
  onModalToggle,
  onBackPress,
}) => {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter adresse de pickup</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Zone</Text>
            <View style={styles.zoneContainer}>
              <TextInput
                style={styles.input}
                placeholder="Veuillez entrer la zone"
                placeholderTextColor="#A7A9B7"
                value={zone}
                onChangeText={onZoneChange}
                editable={false}
              />
              <TouchableOpacity style={styles.mapIcon} onPress={() => onModalToggle(true)}>
                <Ionicons name="map" size={24} color="#54E598" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Entrez l'adresse"
              placeholderTextColor="#A7A9B7"
              value={address}
              onChangeText={onAddressChange}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter l'adresse</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => onModalToggle(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez une zone</Text>
          <MapView
            style={styles.modalMap}
            initialRegion={{
              latitude: 33.8869,
              longitude: 9.5375,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onPress={onMapPress}
            showsUserLocation={true}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={false}
          >
            {location && <Marker coordinate={location} />}
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => onModalToggle(false)}>
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
  mapIcon: { position: "absolute", right: 10, padding: 10 },
  textArea: { height: 100, textAlignVertical: "top" },
  submitButton: { width: 224, height: 37, borderRadius: 5.4, backgroundColor: "#54E598", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 },
  submitButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 },
  modalMap: { width: "100%", height: 400 },
  closeButton: { marginTop: 20, backgroundColor: "#54E598", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});