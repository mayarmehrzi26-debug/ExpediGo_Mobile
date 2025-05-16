import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>Votre solde est :</Text>
          <Text style={styles.balanceAmount}>{balance.amount} {balance.currency}</Text>
        </View>
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
  const balance = {
    amount: "0,000",
    currency: "dt",
  };

  const transactions: Transaction[] = [
    { customerName: "Sarah Ben Ali", amount: 90.0, packageCount: 3, status: "Traitée", paymentMethod: "Espèces", date: "16 Sep 2024", time: "16:08" },
    { customerName: "Amine Khlifi", amount: 90.0, packageCount: 60, status: "Traitée", paymentMethod: "Espèces", date: "16 Sep 2024", time: "16:08" },
    { customerName: "Sarah Ben Ali", amount: 90.0, packageCount: 70, status: "Traitée", paymentMethod: "Virement", date: "16 Sep 2024", time: "16:08" },
  ];
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
      

      <ScrollView style={styles.content} >
      <BalanceCard balance={balance} />
      <TransactionList transactions={transactions} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  balanceCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 1 },
    width: "100%",
    marginBottom: 10,
  },
  balanceText: {
    color: "#27251F",
    fontSize: 14,
    justifyContent: "space-between",

    
  },
  balanceAmount: {
    color: "#7B61FF",
    fontSize: 14,
    fontWeight: "bold",
    
  },
  transactionList: {
    width: "100%",
  },
  transactionCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 11,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customerName: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#27251F",
  },
  amount: {
    fontSize: 12,
    color: "#26273A",
    textAlign: "right",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  packageCount: {
    fontSize: 10,
    color: "#27251F",
  },
  status: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#14804A",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  date: {
    fontSize: 9,
    color: "#26273A",
  },
  time: {
    fontSize: 9,
    color: "#26273A",
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 13,
  },
  cashBadge: {
    backgroundColor: "#54E598",
    paddingTop:6,
    width:62,
  },
  transferBadge: {
    backgroundColor: "#7B5AFF",
paddingTop:5 ,
width:62,
height:22,
 },
  badgeText: {
    fontSize: 8,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Aligne les éléments à gauche et à droite
    alignItems: "center", // Centre verticalement
  },
});

export default Caisse;