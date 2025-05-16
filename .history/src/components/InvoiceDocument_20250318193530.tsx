import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

const tickets = [
  {
    number: "54884",
    title: "Relance du colis",
    service: "Service Commercial",
    status: "Nouveau",
    assignedTo: "sdsdsdsdsdsd",
  },
  {
    number: "54885",
    title: "Problème de livraison",
    service: "Service Client",
    status: "En cours",
    assignedTo: "John Doe",
  },
  // Add more tickets as needed
];

const InvoiceDocument: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.documentWrapper}>
        <Image
          source={require("../../assets/document-bg.png")}
          style={styles.backgroundImage}
        />

        <View style={styles.header}>
          <Text style={styles.documentNumber}>2440107</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Numéro</Text>
            <Text style={styles.label}>Titre</Text>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.label}>Assigné à</Text>
          </View>

          <View style={styles.valueColumn}>
            {tickets.map((ticket, index) => (
              <React.Fragment key={index}>
                <Text style={styles.value}>{ticket.number}</Text>
                <Text style={styles.value}>{ticket.title}</Text>
                <Text style={[styles.value, styles.serviceValue]}>
                  {ticket.service}
                </Text>
                <Text style={[styles.value, styles.statusValue]}>
                  {ticket.status}
                </Text>
                <Text style={styles.value}>{ticket.assignedTo}</Text>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.dateTime}>16 Sep 2024</Text>
          <Text style={styles.dateTime}>16:08</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 314,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    fontWeight: "500",
  },
  documentWrapper: {
    position: "relative",
    aspectRatio: 2.227,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 7,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "130%",
    height: "130%",
    resizeMode: "cover",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 10,
    color: "#1B2128",
    width: 42,
    marginLeft: 242,
  },
  content: {
    alignSelf: "center",
    flexDirection: "row",
    width: 153,
    maxWidth: "100%",
    gap: 30,
    marginTop: 4,
  },
  labelColumn: {
    gap: 9,
  },
  valueColumn: {
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#959595",
  },
  value: {
    fontSize: 9,
    color: "#1B2128",
  },
  serviceValue: {
    color: "#27251F",
  },
  statusValue: {
    color: "#7B61FF",
    width: 36,
  },
  footer: {
    flexDirection: "row",
    gap: 7,
    marginTop: "auto",
  },
  dateTime: {
    fontSize: 6,
    color: "#26273a",
    fontWeight: "400",
  },
});

export default InvoiceDocument;