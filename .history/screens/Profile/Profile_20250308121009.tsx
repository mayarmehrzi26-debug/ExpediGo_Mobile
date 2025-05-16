import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/NavBottom";

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
    "Adresses des pickup",
    "Mauvais clients",
    "Api Key",
    "Se déconnecter",
  ];

  return (
    <View style={styles.container}>
      
      <Header title="Mon Profile" showBackButton={true} />
      <View style={styles.profileContainer}>
       <Image
  source={{ uri: https://avatar.iran.liara.run/public/77" }} 
  style={styles.profileImage}
/>

        <Text style={styles.profileName}>Mayar Mehrzi</Text>
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
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuText: {
    fontSize: 16,
    color: "#1B2128",
  },
  
});

export default Profile;