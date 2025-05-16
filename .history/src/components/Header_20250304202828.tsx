import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = "Nouvelle livraison",
  showBackButton = true,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />
      <View style={styles.container}>
         
        </View>
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#27251F" />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    maxWidth: 390,
    paddingLeft: 24,
    paddingRight: 78,
  },
 
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 37,
    gap: 12,
  },
  backButton: {
    width: 46,
    height: 47,
    borderRadius: 30,
    borderColor: "rgba(232, 236, 244, 1)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    color: "#27251F",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
});

export default Header;
