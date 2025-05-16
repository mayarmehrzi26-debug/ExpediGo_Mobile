import React from "react";
import { Entypo } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Menu } from "react-native-paper";
import StatusBadge from "./StatusBadge";

interface DeliveryCardProps {
  delivery: {
    id: string;
    client: string;
    address: string;
    status: string;
  };
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onViewDetails: (delivery: any) => void;
  onEditPickup: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onEditPickup,
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.deliveryCard}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => onToggleSelection(delivery.id)}>
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]} />
        </TouchableOpacity>
        <Text style={styles.deliveryId}>{delivery.id}</Text>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => onViewDetails(delivery)} title="View details" />
          <Divider />
          <Menu.Item onPress={onEditPickup} title="Edit pickup" />
        </Menu>
      </View>
      <Text style={styles.deliveryClient}>{delivery.client}</Text>
      <View style={styles.separator} />
      <View style={styles.dateContainer}>
        <Text style={styles.deliverySubtitle}>Status</Text>
        <StatusBadge status={delivery.status} />
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.deliverySubtitle}>Destination</Text>
        <Text style={styles.deliveryValue}>{delivery.address}</Text>
      </View>
    </View>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
    marginRight: 173,
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2128",
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  deliveryValue: {
    fontSize: 14,
    color: "#1B2128",
    fontWeight: "bold",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#877DAB",
    borderColor: "#877DAB",
  },
});

export default DeliveryCard;
