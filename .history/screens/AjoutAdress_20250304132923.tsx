import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
    })();
  }, []);

  const handleMapPress = (event: any) => {
    setLocation(event.nativeEvent.coordinate);
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Zone</Text>
            <TextInput
              style={styles.input}
              placeholder="Veuillez entrer la zone"
              placeholderTextColor="#A7A9B7"
              value={zone}
              onChangeText={setZone}
            />
          </View>

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Choisir une zone sur la carte</Text>
            {location && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}
              >
                {location && <Marker coordinate={location} />}
              </MapView>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter l'adresse</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 61,
    paddingBottom: 24,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  textArea: {
    height: 100, // Ajuste la hauteur
    textAlignVertical: 'top', // Aligne le texte en haut comme une textarea
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  map: {
    height: 200,
    borderRadius: 8,
  },
  label: {
    color: "#27251F",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 20,
  },
  input: {
    height: 52,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    fontSize: 14,
    color: "#27251F",
  },
  submitButton: {
    width: 224,
    height: 37,
    borderRadius: 5.4,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
export default AjoutAdress;
