import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InvoiceDocument = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.numeroContainer}>
          <Text style={styles.field}>Numéro: 123456</Text>
        </View>
        <View style={styles.titreContainer}>
          <Text style={styles.field}>Titre: Changement de titre du document</Text>
        </View>
        <View style={styles.serviceContainer}>
          <Text style={styles.field}>Service: Service Commercial</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.dot}>
            <Ionicons name="ellipse" size={12} color="blue" />
          </View>
          <Text style={styles.statusText}>Nouveau</Text>
        </View>
        <View style={styles.assigneeContainer}>
          <Text style={styles.field}>Assigné à: XXXXXXX</Text>
        </View>
        <Text style={styles.dateTime}>16 Sep 2024 - 16:08</Text>
        <Image source={require('./image.png')} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    borderRadius: 10,
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
    marginRight: 5,
  },
  statusText: {
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