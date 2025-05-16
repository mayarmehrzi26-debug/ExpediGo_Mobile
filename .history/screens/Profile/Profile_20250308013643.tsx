import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import React, { useState } from "react";
import { Image,ScrollView, StyleSheet, View,TouchableOpacity ,Text} from "react-native";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/NavBottom";
import Icon from "react-native-vector-icons/Feather";

const Profile: React.FC = () => {
  const navigation = useNavigation(); // Obtenir l'objet de navigation

  const [activeScreen, setActiveScreen] = useState("Profile");
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };
  const menuItems = [
    "Informations personnelles",
    "Informations du Business",
    "Ajouter des collaborateurs",
    "Adresses de pickup",
    "Manuels clients",
    "Api Key",
    "Se déconnecter",
  ];

  return (
    <View style={styles.container}>
      
      <Header title="Mon Profile" showBackButton={true} />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }} // Remplace par l'URL de l'image de profil
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Saber Ben Jebara</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
            <Icon name="chevron-right" size={20} color="#A7A9B7" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  
 
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
 
  
});

export default Profile;