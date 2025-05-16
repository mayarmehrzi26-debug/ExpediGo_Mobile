import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import Header from "../src/components/Header";
const Caisse: React.FC = () => {

// Types
interface Transaction {
    customerName: string;
    amount: number;
    packageCount: number;
    status: "Traitée" | "En cours" | "Annulée";
    paymentMethod: "Espèces" | "Virement";
    date: string;
    time: string;
  }
  
  interface Balance {
    amount: string;
    currency: string;
  }
  
  // PaymentMethodBadge Component
  const PaymentMethodBadge: React.FC<{ method: "Espèces" | "Virement" }> = ({ method }) => {
    return (
      <View style={[styles.badge, method === "Espèces" ? styles.cashBadge : styles.transferBadge]}>
        <Text style={styles.badgeText}>{method}</Text>
      </View>
    );
  };
  
  // BalanceCard Component
  const BalanceCard: React.FC<{ balance: Balance }> = ({ balance }) => {
    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceText}>Votre solde est :</Text>
        <Text style={styles.balanceAmount}>{balance.amount} {balance.currency}</Text>
      </View>
    );
  };
  
  // TransactionCard Component
  const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={styles.customerName}>{transaction.customerName}</Text>
          <Text style={styles.amount}>{transaction.amount.toFixed(3)}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.packageCount}>Nombre de colis : {transaction.packageCount}</Text>
          <Text style={styles.status}>{transaction.status}</Text>
        </View>
        <View style={styles.transactionFooter}>
          <PaymentMethodBadge method={transaction.paymentMethod} />
          <View>
            <Text style={styles.date}>{transaction.date}</Text>
            <Text style={styles.time}>{transaction.time}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // TransactionList Component
  const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    return (
      <ScrollView style={styles.transactionList}>
        {transactions.map((transaction, index) => (
          <TransactionCard key={`${transaction.customerName}-${index}`} transaction={transaction} />
        ))}
      </ScrollView>
    );
  };
  

  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      

      <ScrollView >
       
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  
 
});

export default Caisse;