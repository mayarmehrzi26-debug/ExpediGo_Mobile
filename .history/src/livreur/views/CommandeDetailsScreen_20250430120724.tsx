import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../../src/components/Header";

const CommandeDetailsScreen = ({ route }) => {
  const { commande } = route.params;

  return (
    <View style={styles.container}>
      <Header title="Détails de la commande" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          <DetailRow icon="local-shipping" label="ID Commande" value={commande.id} />
          <DetailRow icon="event" label="Date" value={commande.date} />
          <DetailRow icon="info" label="Statut" value={commande.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses</Text>
          <DetailRow icon="place" label="Origine" value={commande.origin} />
          <DetailRow icon="flag" label="Destination" value={commande.destination} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <DetailRow icon="email" label="Email" value={commande.clientEmail} />
          <DetailRow icon="phone" label="Téléphone" value={commande.clientPhone} />
        </View>

        {commande.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{commande.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={20} color="#44076a" />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'Non spécifié'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
  },
  notesText: {
    color: '#666',
    lineHeight: 22,
  },
});

export default CommandeDetailsScreen;