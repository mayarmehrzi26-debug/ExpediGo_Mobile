import { useRoute } from '@react-navigation/native';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../../FirebaseConfig';
import { LivraisonModel } from '../../livraison/models/LivraisonModel';

const { width, height } = Dimensions.get('window');

interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp?: Date;
}

const LOCATIONIQ_API_KEY = 'pk.17568ced89faf24c4ee34b7efef1d10a'; // À remplacer par votre clé

const TrackingScreen = () => {
  const route = useRoute();
  const { commande } = route.params;
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [fromCoords, setFromCoords] = useState<Coordinate | null>(null);
  const [toCoords, setToCoords] = useState<Coordinate | null>(null);
  const [livreurLocation, setLivreurLocation] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livreurData, setLivreurData] = useState<any>(null);
  const mapRef = useRef<MapView>(null);
  const livraisonModel = useRef(new LivraisonModel()).current;

  // Géocodage avec LocationIQ
  const geocodeWithLocationIQ = async (address: string): Promise<Coordinate> => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data[0]?.lat || !data[0]?.lon) {
        throw new Error('Adresse non trouvée');
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('Erreur LocationIQ:', err);
      throw new Error('Service de géocodage indisponible');
    }
  };

  // Obtenir un itinéraire simplifié (ligne droite)
  const getSimpleRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  const calculateRegion = (coordinates: Coordinate[]) => {
    if (!coordinates || coordinates.length === 0) return null;
  
    const lats = coordinates.map(coord => coord.latitude);
    const lngs = coordinates.map(coord => coord.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
  
    const padding = 0.2; // Padding supplémentaire autour du trajet
  
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) + padding,
      longitudeDelta: Math.abs(maxLng - minLng) + padding,
    };
  };

  // Charger les données du livreur
  useEffect(() => {
    const loadLivreurData = async () => {
      if (commande?.assignedTo) {
        const livreur = await livraisonModel.getUserById(commande.assignedTo);
        setLivreurData(livreur);
      }
    };
    
    loadLivreurData();
  }, [commande?.assignedTo]);

  // Écouter la position du livreur en temps réel
  useEffect(() => {
    if (!commande?.assignedTo) return;

    const livreurLocationRef = doc(firebasestore, "livreurLocations", commande.assignedTo);
    const unsubscribe = onSnapshot(livreurLocationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLivreurLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp?.toDate()
        });
      }
    });

    return () => unsubscribe();
  }, [commande?.assignedTo]);

  useEffect(() => {
    const init = async () => {
      try {
        // Géocodage des deux adresses avec délai pour éviter les limites de taux
        const from = await geocodeWithLocationIQ(commande.origin);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
        const to = await geocodeWithLocationIQ(commande.destination);

        setFromCoords(from);
        setToCoords(to);
        setCoordinates(getSimpleRoute(from, to));
      } catch (err) {
        setError(err.message || 'Erreur de localisation');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [commande.origin, commande.destination]);

  const handleOpenInBrowser = () => {
    if (fromCoords && toCoords) {
      Linking.openURL(
        `https://www.openstreetmap.org/directions?engine=osrm_car&route=${fromCoords.latitude},${fromCoords.longitude};${toCoords.latitude},${toCoords.longitude}`
      );
    }
  };

  const routeRegion = calculateRegion(
    fromCoords && toCoords ? [fromCoords, toCoords] : []
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Livraison #{commande.id.substring(0, 6)}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#44076a" />
          <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
        </View>
      </View>
    );
  }

  if (error || !fromCoords || !toCoords) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Livraison #{commande.id.substring(0, 6)}</Text>
        </View>
        <View style={styles.center}>
          <Icon name="alert-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'Erreur de géocodage'}</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Départ:</Text>
            <Text style={styles.address}>{commande.origin}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Arrivée:</Text>
            <Text style={styles.address}>{commande.destination}</Text>
          </View>
          <TouchableOpacity 
            style={styles.browserButton}
            onPress={handleOpenInBrowser}
          >
            <Text style={styles.browserButtonText}>
              <Icon name="map" size={16} /> Voir sur OpenStreetMap
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Livraison #{commande.id.substring(0, 6)}</Text>
        <Text style={styles.subHeaderText}>
          Statut: {commande.status} | Livreur: {livreurData?.name || 'Non assigné'}
        </Text>
      </View>

      <MapView
        style={styles.map}
        ref={mapRef}
        region={routeRegion}
        onMapReady={() => {
          const allCoordinates = [];
          if (fromCoords) allCoordinates.push(fromCoords);
          if (toCoords) allCoordinates.push(toCoords);
          if (livreurLocation) allCoordinates.push(livreurLocation);

          if (allCoordinates.length > 0) {
            mapRef.current?.fitToCoordinates(allCoordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        }}
      >
        <Marker coordinate={fromCoords}>
          <View style={styles.marker}>
            <Icon name="map-marker" size={30} color="#44076a" />
          </View>
        </Marker>

        <Marker coordinate={toCoords}>
          <View style={styles.marker}>
            <Icon name="flag" size={30} color="#ff6b6b" />
          </View>
        </Marker>

        {/* Marqueur du livreur */}
        {livreurLocation && (
          <Marker coordinate={livreurLocation}>
            <View style={styles.livreurMarker}>
              <Icon name="truck-delivery" size={30} color="#34A853" />
            </View>
          </Marker>
        )}

        {/* Trajet complet */}
        <Polyline
          coordinates={coordinates}
          strokeWidth={3}
          strokeColor="#44076a"
          lineDashPattern={[5, 5]}
        />

        {/* Trajet du livreur vers l'origine (si en cours de pickup) */}
        {commande.status === "En cours de pickup" && livreurLocation && (
          <Polyline
            coordinates={[livreurLocation, fromCoords]}
            strokeWidth={3}
            strokeColor="#FBBC05"
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Trajet du livreur vers la destination (si en cours de livraison) */}
        {commande.status === "En cours de livraison" && livreurLocation && (
          <Polyline
            coordinates={[livreurLocation, toCoords]}
            strokeWidth={3}
            strokeColor="#34A853"
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Icon name="information" size={20} color="#44076a" />
          <Text style={styles.infoText}>
            {livreurLocation 
              ? `Position du livreur mise à jour: ${livreurLocation.timestamp?.toLocaleTimeString() || 'inconnue'}`
              : 'En attente de la position du livreur'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Icon 
            name={commande.status === "Livré" ? "check-circle" : "clock"} 
            size={20} 
            color={commande.status === "Livré" ? "#34A853" : "#FBBC05"} 
          />
          <Text style={[styles.statusText, { 
            color: commande.status === "Livré" ? "#34A853" : "#FBBC05" 
          }]}>
            {commande.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#44076a',
    padding: 15,
    paddingTop: 30,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeaderText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  addressBox: {
    marginVertical: 10,
    width: '100%',
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  address: {
    color: '#666',
  },
  browserButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#44076a',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browserButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  map: {
    width: '100%',
    height: height * 0.7,
  },
  marker: {
    alignItems: 'center',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 12,
  },
});

export default TrackingScreen;