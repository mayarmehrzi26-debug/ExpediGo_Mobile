import React from "react";
import { StyleSheet, Text, View } from "react-native";

const InvoiceDocument = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.field}>Numero: 123456</Text>
      <Text style={styles.field}>Titre: Changement de titre du document</Text>
      <Text style={styles.field}>Service: Service Commercial</Text>
      <View style={styles.statusContainer}>
        <View style={styles.dot} />
        <Text style={styles.status}>Nouveau</Text>
      </View>
      <Text style={styles.field}>Assigné à: XXXXXXX</Text>
      <Text style={styles.dateTime}>16 Sep 2024 - 16:08</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffff",
  },
  field: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "blue",
    marginRight: 5,
  },
  status: {
    fontSize: 16,
  },
  dateTime: {
    fontSize: 14,
    marginTop: 20,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 200,
  },
});

export default InvoiceDocument;