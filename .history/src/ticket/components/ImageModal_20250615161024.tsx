// ImageModal.tsx
import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, View, Image } from 'react-native';

interface ImageModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onClose}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '90%',
    height: '80%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageModal;