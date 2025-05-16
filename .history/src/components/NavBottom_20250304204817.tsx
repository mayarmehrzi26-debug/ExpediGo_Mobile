import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NavBottomProps {
  activeScreen?: string;
}

const NavBottom: React.FC<NavBottomProps> = ({
  activeScreen = "HomeScreen",
}) => {
  const navigation = useNavigation();

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  const getIconColor = (screenName: string) => {
    return activeScreen === screenName ? "#FD5A1E" : "#A7A9B7";
  };

  const getTextStyle = (screenName: string) => {
    return [
      styles.navText,
      { color: activeScreen === screenName ? "#FD5A1E" : "#27251F" },
    ];
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigateToScreen("Pickups")}
        >
          <Ionicons
            name="cube-outline"
            size={26}
            color={getIconColor("Pickups")}
          />
          <Text style={getTextStyle("Pickups")}>Pickups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigateToScreen("Livraison")}
        >
          <Ionicons
            name="bicycle-outline"
            size={26}
            color={getIconColor("Livraisons")}
          />
          <Text style={getTextStyle("Livraisons")}>Livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigateToScreen("HomeScreen")}
        >
          <View style={styles.homeIconContainer}>
            <Ionicons name="home" size={29} color="#FFFFFF" />
          </View>
          <Text style={[styles.navText, styles.homeText]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigateToScreen("Support")}
        >
          <Ionicons
            name="help-circle-outline"
            size={26}
            color={getIconColor("Support")}
          />
          <Text style={getTextStyle("Support")}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigateToScreen("Profile")}
        >
          <Ionicons
            name="person-outline"
            size={26}
            color={getIconColor("Profile")}
          />
          <Text style={getTextStyle("Profile")}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 53,
  },
  navText: {
    fontSize: 9,
    textAlign: "center",
  },
  homeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 33,
    marginTop: -20,
  },
  homeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 33,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  homeText: {
    color: "#27251F",
  },
});

export default NavBottom;
