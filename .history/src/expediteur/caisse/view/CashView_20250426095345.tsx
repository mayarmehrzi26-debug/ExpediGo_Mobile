import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../src/components/Header";
import { CashPresenter } from "./CashPresenter";

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

// ... (styles identiques à votre code original)

export default CashView;