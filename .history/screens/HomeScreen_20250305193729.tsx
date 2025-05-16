import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const navigation = useNavigation();

  const stats = [
    {
      title: "Colis livré",
      thisMonth: 20,
      total: 30,
      icon: "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "En cours de livraison",
      total: 25,
      icon: "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    // Ajoutez d'autres éléments de la liste ici
  ];

  const handleScannerPress = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate('QRScannerScreen');
    } else {
      alert('Permission to access camera denied');
    }
  };

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleScannerPress}>
          <Ionicons name="qr-code-scanner" size={24} color="black" style={{ marginLeft: 190 }} />
        </TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contenu de ScrollView */}
      </ScrollView>

      <View style={styles.bottomNav}>
        {/* Éléments de navigation inférieure */}
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Pickups')}>
          <Ionicons name="cube-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Pickups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Livraison')}>
          <Ionicons name="bicycle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Livraisons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleButtonMode}>
          <Ionicons name="add" size={54} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="help-circle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="person-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Profil</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsAddMode(true);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setIsAddMode(true);
                navigation.navigate("EmballageCommand");
              }}
            >
              <Text style={styles.modalButtonText}>Commande d'emballage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setIsAddMode(true);
                navigation.navigate("NouvelleLivraison");
              }}
            >
              <Text style={styles.modalButtonText}>Nouvelle livraison</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setIsAddMode(true);
            }}
          >
            <Ionicons name="close" size={42} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles
});

export default HomeScreen;