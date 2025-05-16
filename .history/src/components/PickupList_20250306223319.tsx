import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PickupListProps {
  id: string;
  name: string;
  status: string;
  destination: string;
  payment: string;
  date: string;
  onSelect?: () => void;
}

const PickupList: React.FC<PickupListProps> = ({
  id = "2440129",
  name = "Nour Ferjani",
  status = "Annulée par vendeur",
  destination = "Ben arous Ezzahra",
  payment = "165 DT",
  date = "05/12/24 13:43",
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.idSection}>
            <TouchableOpacity style={styles.checkbox} onPress={onSelect} />
            <View style={styles.idDetails}>
              <Text style={styles.idNumber}>{id}</Text>
              <Text style={styles.name}>{name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#A7A9B7" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.labels}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.label}>Paiement</Text>
          <Text style={styles.label}>Date</Text>
        </View>

        <View style={styles.values}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <Text style={styles.destinationText}>{destination}</Text>
          <Text style={styles.paymentText}>{payment}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 340,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    height: 42,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#A7A9B7",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8.5,
    borderWidth: 2,
    borderColor: "#E1E1E2",
  },
  idDetails: {
    flexDirection: "column",
    gap: -2,
  },
  idNumber: {
    color: "#1B2128",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 11,
    fontWeight: "500",
  },
  name: {
    color: "#27251F",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 8,
    fontWeight: "400",
    lineHeight: 14,
  },
  menuButton: {
    width: 27,
    height: 27,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(167,169,183,0.46)",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    height: 98,
    padding: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
  labels: {
    flexDirection: "column",
    gap: 10,
  },
  label: {
    color: "#959595",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 9,
    fontWeight: "500",
  },
  values: {
    flexDirection: "column",
    gap: 9,
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4E51",
    borderRadius: 9,
    paddingVertical: 2,
    paddingHorizontal: 8,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "white",
  },
  statusText: {
    color: "white",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 9,
    fontWeight: "500",
  },
  destinationText: {
    color: "#1B2128",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 9,
    fontWeight: "500",
  },
  paymentText: {
    color: "#FD5A1E",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 9,
    fontWeight: "500",
  },
  dateText: {
    color: "#1B2128",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontSize: 9,
    fontWeight: "500",
  },
});

export default PickupList;
