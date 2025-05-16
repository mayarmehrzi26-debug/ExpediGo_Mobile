import { Camera } from "expo-camera";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  // Demander la permission pour utiliser la caméra
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Fonction pour gérer le scan d'un QR code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Code QR scanné : ${data}`);
    // Vous pouvez naviguer vers un autre écran ou faire quelque chose avec les données scannées
    navigation.navigate("HomeScreen", { scannedData: data }); // Exemple de navigation avec les données scannées
  };

  if (hasPermission === null) {
    return <Text>Demande de permission pour utiliser la caméra...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Accès à la caméra refusé</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#F97316",
    padding: 15,
    borderRadius: 10,
  },
  scanAgainText: {
    color: "white",
    fontSize: 16,
  },
});

