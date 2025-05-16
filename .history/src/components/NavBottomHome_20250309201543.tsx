import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NavBottomProps {
  activeScreen?: string;
}

const NavBottomHome: React.FC<NavBottomProps> = ({
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
            size={32}
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
            size={32}
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
            size={32}
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
            size={32}
            color={getIconColor("Profile")}
          />
          <Text style={getTextStyle("Profile")}>Profile</Text>
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
    fontSize: 10,
    textAlign: "center",
  },
  homeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 43,
    marginTop: -30,
  },
  homeIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#7d3300",
    justifyContent: "center",
    alignItems: "center",
  },
  homeText: {
    color: "#27251F",
  },
});

export default NavBottomHome;
