import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation

interface BarcodeScannerProps {
  onClose: () => void; // Fonction pour fermer la caméra
}

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null); // État pour stocker les données scannées

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Fonction appelée lorsqu'un code à barre est scanné
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedData(data);
    navigation.navigate('PackageDetails', { scannedData: data }); // Naviguer vers la page des détails du colis
    onClose(); // Fermer la caméra après le scan
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'], // Types de codes à barres à scanner
        }}
        onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned} // Désactiver le scan après un succès
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.text}>Close</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Afficher les données scannées */}
      {scannedData && (
        <View style={styles.scannedDataContainer}>
          <Text style={styles.scannedDataText}>Scanned Data: {scannedData}</Text>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScannedData(null)} // Réinitialiser pour un nouveau scan
          >
            <Text style={styles.rescanButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scannedDataContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  scannedDataText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  rescanButton: {
    backgroundColor: '#F97316',
    padding: 10,
    borderRadius: 5,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
  },
});