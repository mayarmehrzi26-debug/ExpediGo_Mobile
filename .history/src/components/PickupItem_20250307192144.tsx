import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, Divider, Provider } from "react-native-paper";
import { Entypo } from "@expo/vector-icons"; // Pour l'icône des trois points

const PickupItem = ({ delivery }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Provider>
      <View >
        <View >
          <Text></Text> 

          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <Entypo name="dots-three-vertical" size={20} color="black" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => console.log("View details")} title="View details" />
            <Divider />
            <Menu.Item onPress={() => console.log("Edit pickup")} title="Edit pickup" />
          </Menu>
        </View>

        <Text style={styles.deliveryClient}>{delivery.client}</Text>
        <Text style={styles.deliverySubtitle}>Destination: {delivery.address}</Text>
        <Text style={styles.deliveryPayment}>Paiement: {delivery.payment} DT</Text>
        <Text style={styles.deliveryDate}>Date: {delivery.date}</Text>
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
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: "#A7A9B7",
    marginTop: 5,
  },
  deliveryPayment: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  deliveryDate: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default PickupItem;
