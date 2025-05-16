import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ClientDetailsPresenter } from "../presenters/ClientDetailsPresenter";

interface ClientDetailsProps {
  route: any;
  navigation: any;
}

const ClientDetailsView: React.FC<ClientDetailsProps> = ({ route, navigation }) => {
  const { clientId } = route.params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const presenter = new ClientDetailsPresenter({
    setClient: (client) => setClient(client),
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    navigateBack: () => navigation.goBack(),
  });

  useEffect(() => {
    presenter.loadClient(clientId);
  }, [clientId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#54E598" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.container}>
        <Text>Client non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Détails du client</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#54E598" />
          <Text style={styles.infoText}>{client.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#54E598" />
          <Text style={styles.infoText}>{client.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color="#54E598" />
          <Text style={styles.infoText}>{client.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adresse</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#54E598" />
          <Text style={styles.infoText}>{client.address}</Text>
        </View>
        
        {client.latitude && client.longitude && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: client.latitude,
                longitude: client.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: client.latitude,
                  longitude: client.longitude
                }}
              />
            </MapView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
  mapContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ClientDetailsView;