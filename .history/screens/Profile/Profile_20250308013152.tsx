import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const ProfileScreen: React.FC = () => {
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
      <View style={styles.header} />
      
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    height: 50,
    backgroundColor: "#FD5A1E",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: -40,
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuText: {
    fontSize: 16,
    color: "#1B2128",
  },
});

export default ProfileScreen;
