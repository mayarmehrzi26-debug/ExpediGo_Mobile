import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import { updateLivraisonStatus } from "../services/commandeService";

const CommandeDetailsScreen = ({ route, navigation }) => {
  const { commande } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Vérification robuste des coordonnées
  const isValidCoord = (coord) => (
    coord !== undefined && 
    coord !== null && 
    !isNaN(Number(coord)) &&
    Math.abs(Number(coord)) <= 180
  );

  const hasValidOrigin = isValidCoord(commande?.originLat) && isValidCoord(commande?.originLng);
  const hasValidDestination = isValidCoord(commande?.destinationLat) && isValidCoord(commande?.destinationLng);

  // Région par défaut centrée sur Paris
  const defaultRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  // Calcule la meilleure région à afficher
  const getMapRegion = () => {
    if (hasValidOrigin && hasValidDestination) {
      return {
        latitude: (Number(commande.originLat) + Number(commande.destinationLat)) / 2,
        longitude: (Number(commande.originLng) + Number(commande.destinationLng)) / 2,
        latitudeDelta: Math.abs(Number(commande.originLat) - Number(commande.destinationLat)) * 1.5 + 0.1,
        longitudeDelta: Math.abs(Number(commande.originLng) - Number(commande.destinationLng)) * 1.5 + 0.1,
      };
    }
    
    if (hasValidOrigin) {
      return {
        latitude: Number(commande.originLat),
        longitude: Number(commande.originLng),
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    if (hasValidDestination) {
      return {
        latitude: Number(commande.destinationLat),
        longitude: Number(commande.destinationLng),
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    return defaultRegion;
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.warn("Erreur de localisation:", error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Section Carte - Toujours affichée */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={getMapRegion()}
            onMapReady={() => setMapReady(true)}
          >
            {/* Marqueur utilisateur */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Votre position"
                pinColor="#4285F4"
              />
            )}

            {/* Marqueur origine */}
            {hasValidOrigin && (
              <Marker
                coordinate={{
                  latitude: Number(commande.originLat),
                  longitude: Number(commande.originLng)
                }}
                title="Origine"
                description={commande.origin}
                pinColor="#FBBC05"
              />
            )}

            {/* Marqueur destination */}
            {hasValidDestination && (
              <Marker
                coordinate={{
                  latitude: Number(commande.destinationLat),
                  longitude: Number(commande.destinationLng)
                }}
                title="Destination"
                description={commande.destination}
                pinColor="#34A853"
              />
            )}
          </MapView>

          {/* Boutons de navigation */}
          <View style={styles.mapButtons}>
            {hasValidOrigin && (
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMaps(commande.originLat, commande.originLng, "Origine")}
              >
                <MaterialIcons name="directions" size={20} color="white" />
                <Text style={styles.mapButtonText}>Vers origine</Text>
              </TouchableOpacity>
            )}

            {hasValidDestination && (
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMaps(commande.destinationLat, commande.destinationLng, "Destination")}
              >
                <MaterialIcons name="directions" size={20} color="white" />
                <Text style={styles.mapButtonText}>Vers destination</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Message d'information */}
        {!hasValidOrigin && !hasValidDestination ? (
          <Text style={styles.warningText}>
            Les coordonnées GPS précises ne sont pas disponibles
          </Text>
        ) : (
          <Text style={styles.infoText}>
            {!hasValidOrigin && "Origine non spécifiée • "}
            {!hasValidDestination && "Destination non spécifiée"}
          </Text>
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
            onPress={hasValidOrigin ? () => openMaps(commande.originLat, commande.originLng, "Origine") : null}
          />
          <DetailRow 
            icon="flag" 
            label="Destination" 
            value={commande.destination}
            onPress={hasValidDestination ? () => openMaps(commande.destinationLat, commande.destinationLng, "Destination") : null}
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
  <TouchableOpacity 
    style={styles.detailRow} 
    onPress={onPress} 
    disabled={!onPress}
  >
    <MaterialIcons name={icon} size={20} color="#44076a" />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text 
      style={[
        styles.detailValue,
        !value && styles.missingValue
      ]}
      numberOfLines={2}
    >
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
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#44076a',
    borderRadius: 4,
    minWidth: '45%',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  warningText: {
    textAlign: 'center',
    color: '#FF9800',
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
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
    marginBottom: 10,
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    width: 100,
    color: '#333',
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#999',
  },
  notesText: {
    color: '#666',
    lineHeight: 22,
    fontSize: 14,
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 16,
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
});

export default CommandeDetailsScreen;