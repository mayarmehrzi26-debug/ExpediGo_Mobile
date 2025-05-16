import { Camera } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CameraView = ({ onClose, onBarCodeScanned }) => {
  return (
    <View style={styles.cameraContainer}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={onBarCodeScanned}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#F97316',
    padding: 15,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CameraView;