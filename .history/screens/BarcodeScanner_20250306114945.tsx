import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig'; // Assurez-vous d'importer correctement votre configuration Firebase

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
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Récupérer les détails du package à partir du code QR scanné
    const querySnapshot = await getDocs(collection(firebasestore, 'packages'));
    const packageData = querySnapshot.docs.find((doc) => doc.data().qrCodeUrl === data)?.data();

    if (packageData) {
      // Afficher les détails du package
      console.log('Détails du package : ', packageData);
      // Mettre à jour l'état pour afficher les détails du package dans l'interface utilisateur
    } else {
      console.log('Aucun package trouvé pour le code QR scanné.');
    }
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

      {/* Afficher les détails de la livraison associés au colis scanné */}
      {scannedData && (
        <View style={styles.scannedDataContainer}>
          <Text style={styles.scannedDataText}>Code QR Scanné: {scannedData}</Text>
          {/* Afficher les détails du package scanné ici */}
          {/* Assurez-vous d'afficher les détails du package correctement en utilisant l'état ou les données récupérées */}
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScannedData(null)} // Réinitialiser pour un nouveau scan
          >
            <Text style={styles.rescanButtonText}>Scanner à nouveau</Text>
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