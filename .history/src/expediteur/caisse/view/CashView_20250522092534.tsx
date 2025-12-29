import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../../components/Header";
import { CashPresenter } from "../presenter/CashPresenter";
import { useAuth } from "../../../context/AuthContext";

const CashView = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState({
    total: "0,000",
    disponible: "0,000",
    enAttente: "0,000",
    currency: "dt"
  });
  const [canRequestWithdrawal, setCanRequestWithdrawal] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const showWithdrawalDialog = (maxAmount: number): Promise<{ amount: number; method: "Espèces" | "Virement" }> => {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        "Demande de retrait",
        `Entrez le montant à retirer (max: ${maxAmount.toFixed(3)} dt)`,
        [
          {
            text: "Annuler",
            onPress: () => reject(new Error("User cancelled")),
            style: "cancel"
          },
          {
            text: "Valider",
            onPress: (amountText) => {
              const amount = parseFloat(amountText.replace(',', '.'));
              if (isNaN(amount) || amount <= 0 || amount > maxAmount) {
                Alert.alert("Erreur", "Montant invalide");
                reject(new Error("Invalid amount"));
                return;
              }
              
              Alert.alert(
                "Mode de versement",
                "Choisissez le mode de versement:",
                [
                  { text: "Espèces", onPress: () => resolve({ amount, method: "Espèces" }) },
                  { text: "Virement", onPress: () => resolve({ amount, method: "Virement" }) },
                  { text: "Annuler", onPress: () => reject(new Error("User cancelled")), style: "cancel" }
                ]
              );
            }
          }
        ],
        "plain-text",
        "",
        "numeric"
      );
    });
  };

  const [presenter] = useState(new CashPresenter({
    displayBalance: setBalance,
    displayTransactions: setTransactions,
    displayWithdrawalRequests: setWithdrawalRequests,
    showError: (msg) => Alert.alert("Erreur", msg),
    showSuccess: (msg) => Alert.alert("Succès", msg),
    setWithdrawalButtonEnabled: (enabled) => setCanRequestWithdrawal(enabled),
    showWithdrawalDialog,
  }, user?.uid || ""));

  useEffect(() => {
    presenter.loadData();
  }, []);

  const handleWithdrawalRequest = async () => {
    await presenter.requestWithdrawal();
  };

  const PaymentMethodBadge = ({ method }: { method: "Espèces" | "Virement" }) => (
    <View style={[styles.badge, method === "Espèces" ? styles.cashBadge : styles.transferBadge]}>
      <Text style={styles.badgeText}>{method}</Text>
    </View>
  );

  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Solde total:</Text>
        <Text style={styles.balanceAmount}>{balance.total} {balance.currency}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Disponible:</Text>
        <Text style={styles.availableAmount}>{balance.disponible} {balance.currency}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>En attente:</Text>
        <Text style={styles.pendingAmount}>{balance.enAttente} {balance.currency}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.ButtonPaymnt, 
          !canRequestWithdrawal && styles.disabledButton
        ]} 
        onPress={handleWithdrawalRequest}
        disabled={!canRequestWithdrawal}
      >
        <Text style={styles.ButtonPaymntText}>
          {canRequestWithdrawal 
            ? "Demander un retrait"
            : "Demande déjà envoyée"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const WithdrawalRequestCard = ({ request }: { request: WithdrawalRequest }) => {
    const getStatusColor = () => {
      switch (request.status) {
        case 'approved': return '#54E598';
        case 'rejected': return '#FF5252';
        default: return '#FF9800';
      }
    };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestAmount}>{request.amount.toFixed(3)} dt</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {request.status === 'pending' ? 'En attente' : 
               request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
            </Text>
          </View>
        </View>
        <View style={styles.requestDetails}>
          <PaymentMethodBadge method={request.paymentMethod} />
          <Text style={styles.requestDate}>
            {request.createdAt.toLocaleDateString()} à {request.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.amount}>{transaction.amount.toFixed(3)} dt</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>{transaction.type}</Text>
        <View style={styles.statusContainer}>
          {transaction.status === "completed" && (
            <Entypo name="dot-single" size={12} color="green" />
          )}
          <Text style={styles.status}>{transaction.status}</Text>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <Text style={styles.date}>
          {transaction.createdAt.toLocaleDateString()} à {transaction.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      <ScrollView style={styles.content}>
        <BalanceCard />
        
        <Text style={styles.sectionTitle}>Demandes de retrait</Text>
        {withdrawalRequests.length > 0 ? (
          withdrawalRequests.map((request) => (
            <WithdrawalRequestCard key={request.id} request={request} />
          ))
        ) : (
          <Text style={styles.noRequestsText}>Aucune demande de retrait</Text>
        )}

        <Text style={styles.sectionTitle}>Historique des transactions</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <Text style={styles.noRequestsText}>Aucune transaction</Text>
        )}
      </ScrollView>
    </View>
  );
};

// Les styles restent les mêmes que dans votre code original
const styles = StyleSheet.create({
  // ... vos styles existants ...
});

export default CashView;

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
  ButtonPaymnt: {
    backgroundColor: "#54E598",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
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
    backgroundColor: "#7B61FF",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#27251F',
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#26273A',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  noRequestsText: {
    textAlign: 'center',
    color: '#959595',
    marginVertical: 10,
  },
});

export default CashView;