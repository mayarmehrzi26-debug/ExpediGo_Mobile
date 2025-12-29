import { Entypo } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebaseAuth } from "../../../../FirebaseConfig";
import Header from "../../../components/Header";
import { CashPresenter } from "../presenter/CashPresenter";

const CashView = () => {
  const [userId, setUserId] = useState<string>("");
  const [balance, setBalance] = useState({
    total: "0.000",
    disponible: "0.000",
    enAttente: "0.000",
    currency: "dt"
  });
  const [canRequestWithdrawal, setCanRequestWithdrawal] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId("");
      }
    });
    
    return unsubscribe;
  }, []);

  const showWithdrawalDialog = (maxAmount: number): Promise<{ amount: number; method: "Espèces" | "Virement" }> => {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        "Demande de versement",
        `Montant en attente disponible: ${maxAmount} dt\nEntrez le montant à verser`,
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
  }, userId));

  useEffect(() => {
    if (userId) {
      presenter.loadData();
    }
  }, [userId]);

  const handleRequestWithdrawal = async () => {
    try {
      const pendingAmount = parseFloat(balance.enAttente);
      if (pendingAmount > 0) {
        await presenter.requestWithdrawal(pendingAmount);
      }
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
    }
  };


  const handlePendingWithdrawal = async () => {
    await presenter.requestPendingWithdrawal();
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
        <Text style={styles.balanceText}>Cash disponible:</Text>
        <Text style={styles.availableAmount}>{balance.disponible} {balance.currency}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Cash en attente:</Text>
        <Text style={styles.pendingAmount}>{balance.enAttente} {balance.currency}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.ButtonPaymnt, 
          (!canRequestWithdrawal || parseFloat(balance.enAttente) <= 0) && styles.disabledButton
        ]} 
        onPress={handleRequestWithdrawal}
        disabled={!canRequestWithdrawal || parseFloat(balance.enAttente) <= 0}
      >
        <Text style={styles.ButtonPaymntText}>
          Demander versement ({balance.enAttente} dt)
        </Text>
      </TouchableOpacity>
    </View>
  );


  const WithdrawalRequestCard = ({ request }) => {
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
              {request.status === 'pending' ? 'Non traité' : 
               request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
            </Text>
          </View>
        </View>
        <View style={styles.requestDetails}>
          <PaymentMethodBadge method={request.paymentMethod} />
          <Text style={styles.requestDate}>
            Demandé le: {request.createdAt.toLocaleDateString()} à {request.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

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
        
        <Text style={styles.sectionTitle}>Demandes de versement</Text>
        {withdrawalRequests.length > 0 ? (
          withdrawalRequests.map((request) => (
            <WithdrawalRequestCard key={request.id} request={request} />
          ))
        ) : (
          <Text style={styles.noRequestsText}>Aucune demande de versement</Text>
        )}

        <Text style={styles.sectionTitle}>Dernières transactions</Text>
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