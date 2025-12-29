import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { firebaseAuth } from "../../../FirebaseConfig";
import Header from "../../components/Header";
import NavBottomClient from "../../components/shared/NavBottomClient";

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  role?: string;
}

const ProfileClient: React.FC = () => {
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState("Profile");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = firebaseAuth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          setUserData({
            name: userDoc.data().name || user.displayName || "Utilisateur",
            email: user.email || "",
            phone: userDoc.data().phone || "",
            photoURL: user.photoURL || "https://avatar.iran.liara.run/public/77",
            role: userDoc.data().role || "user"
          });
        } else {
          // Si le document n'existe pas, utiliser les données de base de l'authentification
          setUserData({
            name: user.displayName || "Utilisateur",
            email: user.email || "",
            photoURL: user.photoURL || "https://avatar.iran.liara.run/public/77",
            role: "user"
          });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const menuItems = [
    { label: "Informations personnelles", route: "InfoPerso" },

    { label: "Se déconnecter", route: "Logout" },
  ];

  const handleMenuItemPress = (route: string) => {
    if (route === "Logout") {
      firebaseAuth.signOut();
      navigation.navigate("Login");
    } else {
      navigation.navigate(route);
    }
  };

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <Header title="Mon Profile" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <Text>Chargement du profil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mon Profile" showBackButton={true} />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: userData.photoURL }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userData.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.route)}
          >
            <Text style={styles.menuText}>{item.label}</Text>
            <Icon name="chevron-right" size={20} color="#877DAB" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <NavBottomClient activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
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
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  profilePhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  profileRole: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
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

export default ProfileClient;