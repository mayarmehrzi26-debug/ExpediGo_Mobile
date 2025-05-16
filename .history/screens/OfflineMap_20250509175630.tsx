import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import localMap from './local-map.osm'; // Fichier OSM téléchargé

const { width, height } = Dimensions.get('window');

const OfflineMap = ({ fromCoords, toCoords }) => {
  // Convertir le fichier OSM en GeoJSON (à implémenter)
  // const mapData = convertOsmToGeoJSON(localMap);
  
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: (fromCoords.latitude + toCoords.latitude) / 2,
        longitude: (fromCoords.longitude + toCoords.longitude) / 2,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker coordinate={fromCoords} title="Départ" />
      <Marker coordinate={toCoords} title="Arrivée" />
      <Polyline
        coordinates={[fromCoords, toCoords]}
        strokeColor="#44076a"
        strokeWidth={4}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default OfflineMap;