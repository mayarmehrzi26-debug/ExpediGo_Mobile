import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

interface InvoiceDocumentProps {
  documentNumber: number;
  ticketNumber: string;
  ticketTitle: string;
  ticketService: string;
  ticketStatus: string;
  ticketType: string; // Ajout du type de ticket
  assignedTo: string;
  date: string;
  time: string;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  documentNumber,
  ticketNumber,
  ticketTitle,
  ticketService,
  ticketStatus = "Non traité", // Initialisation par défaut
  ticketType,
  assignedTo,
  date,
  time,
}) => {
  // Fonction pour le style du statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Non traité":
        return styles.statusPending;
      case "En cours":
        return styles.statusInProgress;
      case "Résolu":
        return styles.statusResolved;
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
            <Text style={styles.label}>Type</Text>
            <Text style={styles.label}>Statut</Text>
          </View>

          <View style={styles.valueColumn}>
            <Text style={styles.value}>{ticketNumber || "N/A"}</Text>
            <Text style={styles.value}>{ticketTitle || "N/A"}</Text>
            <Text style={[styles.value, styles.serviceValue]}>
              {ticketService || "N/A"}
            </Text>
            <Text style={styles.value}>{ticketType || "N/A"}</Text>
            <Text style={[styles.value, getStatusStyle(ticketStatus)]}>
              {ticketStatus}
            </Text>
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
  },
  documentWrapper: {
    position: "relative",
    aspectRatio: 2.227,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 7,
    borderRadius: 4,
    overflow: 'hidden',
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
    opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 10,
    color: "#1B2128",
    marginLeft: 260,
  },
  content: {
    alignSelf: "center",
    flexDirection: "row",
    width: 153,
    maxWidth: "100%",
    gap: 60,
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
  // Styles de statut
  statusPending: {
    color: "#FF9800", // Orange pour "Non traité"
  },
  statusInProgress: {
    color: "#2196F3", // Bleu pour "En cours"
  },
  statusResolved: {
    color: "#4CAF50", // Vert pour "Résolu"
  },
  statusDefault: {
    color: "#7B61FF", // Violet par défaut
  },
  footer: {
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  dateTime: {
    fontSize: 6,
    color: "#26273a",
    fontWeight: "400",
  },
});

export default InvoiceDocument;