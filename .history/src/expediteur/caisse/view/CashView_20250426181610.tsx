import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../../components/Header";
import { CaissePresenter } from "../presenter/CashPresenter";

const CashView = () => {
  const [balance, setBalance] = useState({
    amount: "0,000",
    availableAmount: "0,000",
    pendingAmount: "0,000",
    currency: "dt"
  });
  
  const [transactions, setTransactions] = useState([]);
  const [presenter] = useState(new CaissePresenter({
    displayBalance: setBalance,
    displayTransactions: setTransactions,
    showError: (msg) => Alert.alert("Erreur", msg),
    showSuccess: (msg) => Alert.alert("Succès", msg),
  }));

  useEffect(() => {
    presenter.loadData();
  }, []);

  const handlePendingWithdrawal = async () => {
    await presenter.requestPendingWithdrawal();
  };

  // Composants internes
  const PaymentMethodBadge = ({ method }) => (
    <View style={[styles.badge, method === "Espèces" ? styles.cashBadge : styles.transferBadge]}>
      <Text style={styles.badgeText}>{method}</Text>
    </View>
  );

  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Solde total:</Text>
        <Text style={styles.balanceAmount}>{balance.amount} {balance.currency}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Disponible:</Text>
        <Text style={styles.availableAmount}>{balance.availableAmount} {balance.currency}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>non disponible:</Text>
        <Text style={styles.pendingAmount}>{balance.pendingAmount} {balance.currency}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.ButtonPaymnt, 
          parseFloat(balance.pendingAmount) <= 0 && styles.disabledButton
        ]} 
        onPress={handlePendingWithdrawal}
        disabled={parseFloat(balance.pendingAmount) <= 0}
      >
        <Text style={styles.ButtonPaymntText}>
          Demander versement ({balance.pendingAmount} dt)
        </Text>
      </TouchableOpacity>
    </View>
  );

  const TransactionCard = ({ transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.customerName}>{transaction.customerName}</Text>
        <Text style={styles.amount}>{transaction.amount.toFixed(3)}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.packageCount}>Colis: {transaction.packageCount}</Text>
        <View style={styles.statusContainer}>
          {transaction.status === "Traitée" && (
            <Entypo name="dot-single" size={12} color="green" />
          )}
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

  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      <ScrollView style={styles.content}>
        <BalanceCard />
        {transactions.map((transaction, index) => (
          <TransactionCard key={`${transaction.id}-${index}`} transaction={transaction} />
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
    padding: 16,
  },
  balanceCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 14,
    color: "#27251F",
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7B61FF",
  },
  availableAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#54E598",
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9800",
  },
  withdrawalForm: {
    marginTop: 16,
  },
  input: {
    height: 40,
    borderColor: "#A7A9B7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  ButtonPaymnt: {
    backgroundColor: "#54E598",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  ButtonPaymntText: {
    color: "white",
    fontWeight: "bold",
  },
  transactionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  customerName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  packageCount: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    fontSize: 12,
    color: "#14804A",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  cashBadge: {
    backgroundColor: "#54E598",
  },
  transferBadge: {
    backgroundColor: "#7B61FF",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
});

export default CashView;