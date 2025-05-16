import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CameraViewProps {
  onClose: () => void;
  onBarCodeScanned: (data: { type: string; data: string }) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onClose, onBarCodeScanned }) => {
  return (
    <View style={styles.cameraContainer}>
      
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
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
});

export default CameraView;