import { Entypo } from "@expo/vector-icons"; // Pour l'icône des trois points
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Menu, Provider } from "react-native-paper";

const PickupItem = ({ delivery }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation(); // Hook pour la navigation

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleViewDetails = () => {
    closeMenu(); // Fermer le menu avant la navigation
    navigation.navigate("PackageDetails", { scannedData: delivery.id });
  };

  return (
    <Provider>
      <View style={styles.deliveryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.deliveryId}>Colis #{delivery.id}</Text>

          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <Entypo name="dots-three-vertical" size={20} color="black" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={handleViewDetails} title="View details" />
            <Divider />
            <Menu.Item onPress={() => console.log("Edit pickup")} title="Edit pickup" />
          </Menu>
        </View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default PickupItem;
