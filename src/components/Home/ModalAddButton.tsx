import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeScreenNavigationProp } from '../../../NavigationTypes';

const ModalAddButton: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={toggleButtonMode}
      >
        <Ionicons name={isAddMode ? 'add' : 'close'} size={34} color="white" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={toggleButtonMode}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                toggleButtonMode();
                navigation.navigate('EmballageCommand');
              }}
            >
              <Text style={styles.modalButtonText}>Commande d'emballage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                toggleButtonMode();
                navigation.navigate('NouvelleLivraison');
              }}
            >
              <Text style={styles.modalButtonText}>Nouvelle livraison</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={toggleButtonMode}
        >
          <Ionicons name="close" size={42} color="white" />
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    justifyContent: "center",
    bottom: 80,
    right: 20,
    zIndex: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 393,
  },
  modalButton: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    borderColor: "#877DAB",
    borderWidth: 2,
  },
  modalButtonText: {
    color: "#877DAB",
    fontWeight: "600",
  },
  closeButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    justifyContent: "center",
  },
});

export default ModalAddButton;