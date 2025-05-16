import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBadge } from "./StatusBadge";

interface PickupDetailsProps {
  destination: string;
  payment: string;
  date: string;
}

export const PickupDetails: React.FC<PickupDetailsProps> = ({
  destination,
  payment,
  date,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.label}>Destination</Text>
        <Text style={styles.label}>Paiement</Text>
        <Text style={styles.label}>Date</Text>
      </View>
      <View style={styles.values}>
        <StatusBadge />
        <Text style={styles.destination}>{destination}</Text>
        <Text style={styles.payment}>{payment}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 98,
    padding: 5,
    paddingTop: 6,
    paddingBottom: 6,
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    flexDirection: "row",
  },
  labels: {
    flexDirection: "column",
    gap: 10,
  },
  label: {
    color: "#959595",
    fontFamily: "Avenir",
    fontSize: 9,
    fontWeight: "500",
  },
  values: {
    flexDirection: "column",
    gap: 9,
  },
  destination: {
    color: "#1B2128",
    fontFamily: "Avenir",
    fontSize: 9,
    fontWeight: "500",
  },
  payment: {
    color: "#FD5A1E",
    fontFamily: "Avenir",
    fontSize: 9,
    fontWeight: "500",
  },
  date: {
    color: "#1B2128",
    fontFamily: "Avenir",
    fontSize: 9,
    fontWeight: "500",
  },
});
