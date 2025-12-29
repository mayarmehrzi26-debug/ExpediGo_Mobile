import { Entypo } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebaseAuth } from "../../../../FirebaseConfig";
import Header from "../../../components/Header";
import { CashPresenter } from "../presenter/CashPresenter";

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  paymentMethod: "Espèces" | "Virement";
  createdAt: Date;
  transactionIds?: string[];
}

interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  packageCount: number;
  status: string;
  paymentMethod: "Espèces" | "Virement";
  date: string;
  time: string;
}

interface PendingTransaction {
  id: string;
  customerName: string;
  amount: number;
  createdAt: Date;
}

const CashView = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState({
    total: "0.000",
    disponible: "0.000",
    enAttente: "0.000",
    currency: "dt"
  });
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showTransactionSelection, setShowTransactionSelection] = useState(false);
  const [canRequestWithdrawal, setCanRequestWithdrawal] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [presenter, setPresenter] = useState<CashPresenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolveSelection, setResolveSelection] = useState<(ids: string[]) => void>(() => {});

  const displayPendingTransactions = (transactions: PendingTransaction[]) => {
    setPendingTransactions(transactions);
    setShowTransactionSelection(true);
  };

const showTransactionSelectionDialog = (transactions: PendingTransaction[]): Promise<string[]> => {
  return new Promise((resolve) => {
    setPendingTransactions(transactions);
    setSelectedTransactions([]);
    setShowTransactionSelection(true);
    
    // Stockez la fonction resolve pour l'utiliser plus tard
    setResolveSelection(() => resolve);
  });
};

const handleConfirmSelection = () => {
  setShowTransactionSelection(false);
  resolveSelection(selectedTransactions);
};

const handleCancelSelection = () => {
  setShowTransactionSelection(false);
  resolveSelection([]);
};

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

  const TransactionSelectionItem = ({ 
    transaction,
    isSelected,
    onToggle
  }: {
    transaction: PendingTransaction;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <TouchableOpacity 
      style={[
        styles.transactionItem,
        isSelected && styles.selectedTransactionItem
      ]}
      onPress={() => onToggle(transaction.id)}
    >
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionCustomer}>{transaction.customerName}</Text>
        <Text style={styles.transactionDate}>
          {transaction.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.transactionAmount}>
        {transaction.amount.toFixed(3)} dt
      </Text>
      {isSelected && (
        <Entypo name="check" size={20} color="#54E598" />
      )}
    </TouchableOpacity>
  );

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      setUserId(user.uid);
      const newPresenter = new CashPresenter({
        displayBalance: setBalance,
        displayTransactions: setTransactions,
        displayWithdrawalRequests: setWithdrawalRequests,
        showError: (msg) => Alert.alert("Erreur", msg),
        showSuccess: (msg) => Alert.alert("Succès", msg),
        setWithdrawalButtonEnabled: (enabled) => setCanRequestWithdrawal(enabled),
        showWithdrawalDialog,
        displayPendingTransactions, // Ajoutez cette ligne
        showTransactionSelectionDialog // Ajoutez cette ligne
      }, user.uid);
      
      setPresenter(newPresenter);
      newPresenter.loadData().finally(() => setIsLoading(false));
    } else {
      setUserId(null);
      setPresenter(null);
      setIsLoading(false);
    }
  });
  
  return unsubscribe;
}, []);

const handleRequestWithdrawal = async () => {
  if (!presenter) return;
  
  try {
    await presenter.prepareWithdrawal();
  } catch (error) {
    Alert.alert("Erreur", error.message || "Échec de la demande");
  }
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
          Demander versement 
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
      <Text style={styles.customerName}>{transaction.customerName}</Text>
      <Text style={styles.amount}>{transaction.amount.toFixed(3)} dt</Text>
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.packageCount}>Colis: {transaction.packageCount}</Text>
      <View style={styles.statusContainer}>
        {transaction.status === "Traitée" && (
          <Entypo name="dot-single" size={12} color="green" />
        )}
        {transaction.status === "En attente" && (
          <Entypo name="dot-single" size={12} color="orange" />
        )}
        {transaction.status === "Non traité" && (
          <Entypo name="dot-single" size={12} color="gray" />
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B61FF" />
      </View>
    );
  }

  if (!userId || !presenter) {
    return (
      <View style={styles.notLoggedContainer}>
        <Text>Veuillez vous connecter pour accéder à cette fonctionnalité</Text>
      </View>
    );
  }

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
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <Text style={styles.noRequestsText}>Aucune transaction</Text>
        )}
      </ScrollView>

      {/* Transaction Selection Modal */}
<Modal
        animationType="slide"
        transparent={true}
        visible={showTransactionSelection}
        onRequestClose={handleCancelSelection}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez les transactions</Text>
            
            <ScrollView style={styles.transactionList}>
              {pendingTransactions.map((transaction) => (
                <TransactionSelectionItem
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransactions.includes(transaction.id)}
                  onToggle={(id) => {
                    setSelectedTransactions(prev => 
                      prev.includes(id) 
                        ? prev.filter(i => i !== id)
                        : [...prev, id]
                    );
                  }}
                />
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Text style={styles.totalText}>
                Total sélectionné: {selectedTransactions.reduce(
                  (sum, id) => {
                    const t = pendingTransactions.find(t => t.id === id);
                    return sum + (t?.amount || 0);
                  }, 0
                ).toFixed(3)} dt
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelSelection}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmSelection}
                  disabled={selectedTransactions.length === 0}
                >
                  <Text style={styles.buttonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7'
  },
  notLoggedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 20
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  transactionList: {
    maxHeight: '60%',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedTransactionItem: {
    backgroundColor: '#f5f5f5',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontWeight: 'bold',
  },
  transactionDate: {
    color: '#666',
    fontSize: 12,
  },
  transactionAmount: {
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  modalFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  totalText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#54E598',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CashView;