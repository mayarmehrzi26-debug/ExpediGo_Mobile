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
  // Function to get status-specific styling
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "standard":
        return styles.statusStandard;
      case "retard de livraison":
        return styles.statusRetard;
      case "changer le prix du colis":
        return styles.statusPrix;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.documentWrapper}>
        <Image
          source={require("../../../assets/document-bg.png")}
          style={styles.backgroundImage}
        />

        <View style={styles.header}>
          <Text style={styles.documentNumber}>#{documentNumber}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Numéro</Text>
            <Text style={styles.label}>Titre</Text>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.label}>Statut</Text>
            <Text style={styles.label}>Assigné à</Text>
          </View>

          <View style={styles.valueColumn}>
            <Text style={styles.value}>{ticketNumber || "N/A"}</Text>
            <Text style={styles.value}>{ticketTitle || "N/A"}</Text>
            <Text style={[styles.value, styles.serviceValue]}>
              {ticketService || "N/A"}
            </Text>
            <Text style={[styles.value, getStatusStyle(ticketStatus)]}>
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentWrapper: {
    position: "relative",
    aspectRatio: 2.227,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  documentNumber: {
    fontSize: 12,
    color: "#1B2128",
    fontWeight: "600",
  },
  content: {
    flexDirection: "row",
    width: "100%",
    gap: 24,
    marginBottom: 12,
  },
  labelColumn: {
    gap: 8,
  },
  valueColumn: {
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#959595",
    fontWeight: "500",
  },
  value: {
    fontSize: 10,
    color: "#1B2128",
    fontWeight: "500",
  },
  serviceValue: {
    color: "#27251F",
    fontWeight: "600",
  },
  // Status styles
  statusStandard: {
    color: "#4CAF50", // Green
    fontWeight: "600",
  },
  statusRetard: {
    color: "#FF9800", // Orange
    fontWeight: "600",
  },
  statusPrix: {
    color: "#F44336", // Red
    fontWeight: "600",
  },
  statusDefault: {
    color: "#7B61FF", // Purple
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: "auto",
    justifyContent: "flex-end",
  },
  dateTime: {
    fontSize: 8,
    color: "#26273a",
    fontWeight: "400",
  },
});

export default InvoiceDocument;