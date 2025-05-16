import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from 'expo-location';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { updateLivraisonStatus } from "../services/commandeService";

const CommandeDetailsScreen = ({ route, navigation }) => {
  const { commande } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [error, setError] = useState(null);

  // Vérification des coordonnées
  const hasValidCoordinates = (
    commande?.originLat !== undefined && 
    commande?.originLat !== null &&
    commande?.originLng !== undefined && 
    commande?.originLng !== null &&
    commande?.destinationLat !== undefined && 
    commande?.destinationLat !== null &&
    commande?.destinationLng !== undefined && 
    commande?.destinationLng !== null &&
    !isNaN(commande.originLat) &&
    !isNaN(commande.originLng) &&
    !isNaN(commande.destinationLat) &&
    !isNaN(commande.destinationLng)
  );

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission de localisation refusée');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (hasValidCoordinates) {
          setMapRegion({
            latitude: (location.coords.latitude + commande.destinationLat) / 2,
            longitude: (location.coords.longitude + commande.destinationLng) / 2,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (err) {
        setError('Erreur de localisation');
        console.error(err);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    const success = await updateLivraisonStatus(commande.id, newStatus);
    if (success) {
      navigation.goBack();
      navigation.navigate('MesCommandes', { refresh: true });
    }
  };

  const handleAction = async () => {
    switch (commande.status) {
      case "Non traité":
        await handleStatusUpdate("En attente d'enlèvement");
        break;
      case "En attente d'enlèvement":
        await handleStatusUpdate("En cours de pickup");
        break;
      case "En cours de pickup":
        await handleStatusUpdate("Picked");
        break;
      case "Picked":
        await handleStatusUpdate("En cours de livraison");
        break;
      case "En cours de livraison":
        showDeliveryConfirmation();
        break;
      default:
        return;
    }
  };

  const showDeliveryConfirmation = () => {
    Alert.alert(
      "Confirmation de livraison",
      "Avez-vous remis le colis au destinataire ?",
      [
        {
          text: "Oui, livraison réussie",
          onPress: () => handleStatusUpdate("Livré"),
        },
        {
          text: "Non, retour ou échange",
          onPress: () => handleStatusUpdate("Retour"),
          style: "destructive",
        },
      ]
    );
  };

  const getButtonText = () => {
    switch (commande.status) {
      case "Non traité": return "Prendre la commande";
      case "En attente d'enlèvement": return "Commencer le pickup";
      case "En cours de pickup": return "Terminer le pickup";
      case "Picked": return "Commencer la livraison";
      case "En cours de livraison": return "Terminer la livraison";
      default: return "";
    }
  };

  const shouldShowButton = () => {
    return ["Non traité", "En attente d'enlèvement", "En cours de pickup", "Picked", "En cours de livraison"].includes(commande.status);
  };

  const openMaps = (lat, lng, label) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
    Linking.openURL(url).catch(err => Alert.alert("Erreur", "Impossible d'ouvrir Google Maps"));
  };

  if (loadingLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Section Carte */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) :hasValidCoordinates ? (
          <View style={styles.mapContainer}>
            <MapView 
              style={styles.map} 
              initialRegion={{
                latitude: (commande.originLat + commande.destinationLat) / 2,
                longitude: (commande.originLng + commande.destinationLng) / 2,
                latitudeDelta: Math.abs(commande.originLat - commande.destinationLat) * 1.5 + 0.01,
                longitudeDelta: Math.abs(commande.originLng - commande.destinationLng) * 1.5 + 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: commande.originLat,
                  longitude: commande.originLng
                }}
                title="Origine"
                description={commande.origin}
              />
              <Marker
                coordinate={{
                  latitude: commande.destinationLat,
                  longitude: commande.destinationLng
                }}
                title="Destination"
                description={commande.destination}
                pinColor="green"
              />
            </MapView>

            <View style={styles.mapButtons}>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMaps(commande.originLat, commande.originLng, "Origine")}
              >
                <MaterialIcons name="directions" size={20} color="white" />
                <Text style={styles.mapButtonText}>Aller à l'origine</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMaps(commande.destinationLat, commande.destinationLng, "Destination")}
              >
                <MaterialIcons name="directions" size={20} color="white" />
                <Text style={styles.mapButtonText}>Aller à destination</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Coordonnées GPS non disponibles pour cette commande</Text>
        )}

        {/* Sections d'informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          <DetailRow icon="local-shipping" label="ID Commande" value={commande.id} />
          <DetailRow icon="event" label="Date" value={commande.date} />
          <DetailRow icon="info" label="Statut" value={commande.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses</Text>
          <DetailRow 
            icon="place" 
            label="Origine" 
            value={commande.origin} 
            onPress={hasValidCoordinates ? () => openMaps(commande.originLat, commande.originLng, "Origine") : null}
          />
          <DetailRow 
            icon="flag" 
            label="Destination" 
            value={commande.destination}
            onPress={hasValidCoordinates ? () => openMaps(commande.destinationLat, commande.destinationLng, "Destination") : null}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <DetailRow icon="email" label="Email" value={commande.clientEmail} />
          <DetailRow icon="phone" label="Téléphone" value={commande.clientPhone} />
        </View>

        {commande.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{commande.notes}</Text>
          </View>
        )}

        {/* Bouton d'action */}
        {shouldShowButton() && (
          <TouchableOpacity 
            style={[
              styles.actionButton,
              commande.status === "Non traité" && styles.primaryButton,
              commande.status === "En attente d'enlèvement" && styles.secondaryButton,
              commande.status === "En cours de pickup" && styles.orangeButton,
              commande.status === "Picked" && styles.tertiaryButton,
              commande.status === "En cours de livraison" && styles.successButton
            ]}
            onPress={handleAction}
          >
            <Text style={styles.actionButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.detailRow} onPress={onPress} disabled={!onPress}>
    <MaterialIcons name={icon} size={20} color="#44076a" />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
      {value || 'Non spécifié'}
    </Text>
    {onPress && <MaterialIcons name="chevron-right" size={20} color="#666" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#44076a',
    borderRadius: 4,
  },
  mapButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    flexShrink: 1,
  },
  notesText: {
    color: '#666',
    lineHeight: 22,
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#44076a",
  },
  secondaryButton: {
    backgroundColor: "#877DAB",
  },
  orangeButton: {
    backgroundColor: "#FFA500",
  },
  tertiaryButton: {
    backgroundColor: "#5D8BF4",
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
});

export default CommandeDetailsScreen;