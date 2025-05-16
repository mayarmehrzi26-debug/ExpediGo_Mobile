import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

interface InvoiceDocumentProps {
  documentNumber: number;
  ticketNumber: string;
  ticketTitle: string;
  ticketService: string;
  ticketStatus: string;
  assignedTo: string;
  date: string;
  time: string;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  documentNumber,
  ticketNumber,
  ticketTitle,
  ticketService,
  ticketStatus,
  assignedTo,
  date,
  time,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.documentWrapper}>
        <Image
          source={require("../../../assets/document-bg.png")}
          style={styles.backgroundImage}
        />

        <View style={styles.header}>
          <Text style={styles.documentNumber}>{documentNumber}</Text>
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
            <Text style={styles.value}>{ticketNumber || "N/A"}</Text>
            <Text style={styles.value}>{ticketTitle || "N/A"}</Text>
            <Text style={[styles.value, styles.serviceValue]}>
              {ticketService || "N/A"}
            </Text>
            <Text style={[styles.value, styles.statusValue]}>
              {ticketStatus || "N/A"}
            </Text>
            <Text style={styles.value}>{assignedTo || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.dateTime}>{date}</Text>
          <Text style={styles.dateTime}>{time}</Text>
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