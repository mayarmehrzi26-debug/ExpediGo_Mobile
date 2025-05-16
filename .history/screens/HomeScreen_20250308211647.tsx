import { Bell } from "lucide-react"; // Assurez-vous que ce composant est compatible avec React Native
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const handleWithdrawalRequest = () => {
    // Implement withdrawal request logic
    console.log("Withdrawal requested");
  };

  const transactions = [
    { amount: "90,000 DT", date: "24/25/2021" },
    { amount: "90,000 DT", date: "24/25/2021" },
    { amount: "90,000 DT", date: "24/25/2021" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>indigo</Text>
        <Bell style={styles.bellIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.main}>
        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Ma Caisse</Text>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Cash Disponible</Text>
              <Text style={styles.balanceValue}>0,000 dt</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Cash non Disponible</Text>
              <Text style={styles.balanceValue}>115,000 dt</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Total</Text>
              <Text style={styles.balanceValue}>115,000 dt</Text>
            </View>
          </View>

          <Text style={styles.infoText}>
            Rendez-vous visite pendant les jours suivants pour retirer votre argent:
          </Text>
          <Text style={styles.scheduleText}>Mercredi: De 10:00 vers 15:00</Text>
          <Text style={styles.scheduleText}>Vendredi: De 10:00 vers 15:00</Text>

          <TouchableOpacity style={styles.button} onPress={handleWithdrawalRequest}>
            <Text style={styles.buttonText}>Demander un versement</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Section */}
        <View style={styles.transactionSection}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>

          {transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionRow}>
              <View style={styles.transactionDot} />
              <Text style={styles.transactionAmount}>{transaction.amount}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={() => console.log("View more transactions")}>
            <Text style={styles.buttonText}>Voir plus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  logo: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: '600',
  },
  bellIcon: {
    height: 24,
    width: 24,
  },
  main: {
    padding: 16,
  },
  accountSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  balanceContainer: {
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#666',
  },
  balanceValue: {
    color: '#333',
    fontWeight: '500',
  },
  infoText: {
    color: '#666',
    marginBottom: 5,
  },
  scheduleText: {
    color: '#333',
  },
  button: {
    backgroundColor: '#00d68f',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  transactionSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
    marginRight: 10,
  },
  transactionAmount: {
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  transactionDate: {
    color: '#666',
  },
});

export default HomeScreen;