import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../../components/Header";
import { CashPresenter } from "../preCashPresenter";

const CashView = () => {
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [transactions, setTransactions] = useState([]);
  const [presenter] = useState(new CashPresenter({
    displayBalance: (balance) => setBalance(balance),
    displayTransactions: (transactions) => setTransactions(transactions),
    updateBalance: (balance) => setBalance(balance),
    showError: (message) => alert(message),
    showSuccess: (message) => alert(message)
  }));

  useEffect(() => {
    presenter.loadData();
  }, []);

  const formatAmount = (amount: number) => {
    return amount.toFixed(3) + " dt";
  };

  const PaymentMethodBadge = ({ method }: { method: "Espèces" | "Virement" }) => (
    <View style={[styles.badge, method === "Espèces" ? styles.cashBadge : styles.transferBadge]}>
      <Text style={styles.badgeText}>{method}</Text>
    </View>
  );

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.customerName}>{transaction.customerName}</Text>
        <Text style={styles.amount}>{formatAmount(transaction.amount)}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.packageCount}>Colis: {transaction.packageCount}</Text>
        <View style={styles.statusContainer}>
          {transaction.status === "Traitée" && <Entypo name="dot-single" size={12} color="green" />}
          <Text style={styles.status}>{transaction.status}</Text>
        </View>
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

  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Solde disponible:</Text>
        <Text style={styles.balanceAmount}>{formatAmount(balance.available)}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>En attente de versement:</Text>
        <Text style={styles.pendingAmount}>{formatAmount(balance.pending)}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => presenter.requestPayment()} 
        style={styles.ButtonPaymnt}
        disabled={balance.available <= 0}
      >
        <Text style={styles.ButtonPaymntText}>
          {balance.available > 0 ? "Demander versement" : "Solde indisponible"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      <ScrollView style={styles.content}>
        <BalanceCard />
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
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
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    transactionList: {
      width: "100%",
    },
    transactionCard: {
      backgroundColor: "white",
      padding: 20,
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
      fontSize: 14,
      color: "#26273A",
      textAlign: "right",
      fontWeight: "bold",
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
      textAlign: "right",
    },
    badge: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 13,
    },
    cashBadge: {
      backgroundColor: "#54E598",
      paddingTop: 5,
      width: 62,
      height: 22,
    },
    transferBadge: {
      backgroundColor: "#7B5AFF",
      paddingTop: 5,
      width: 62,
      height: 22,
    },
    badgeText: {
      fontSize: 8,
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
    },
    balanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    ButtonPaymnt: {
      backgroundColor: "#54E598",
      padding: 6,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 16,
      marginLeft: 156,
      width: 160,
    },
    ButtonPaymntText: {
      color: "white",
      textAlign: "center",
      fontSize: 12,
    },
  });
export default CashView;