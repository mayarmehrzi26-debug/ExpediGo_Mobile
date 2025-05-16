import { useNavigation } from '@react-navigation/native';
import { collection, doc, getDoc, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { firebasestore } from '../../FirebaseConfig';

interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  packageCount: number;
  status: "Traitée" | "En cours" | "Annulée";
  paymentMethod: "Espèces" | "Virement";
  date: string;
  time: string;
}

interface Balance {
  amount: number;
  availableAmount: number;
  pendingAmount: number;
  currency: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  paymentMethod: "Espèces" | "Virement";
  createdAt: Date;
}

const CashBox: React.FC = () => {
  const navigation = useNavigation();
  const [animation] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState<Balance>({ 
    amount: 0,
    availableAmount: 0,
    pendingAmount: 0,
    currency: "dt"
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [canRequestWithdrawal, setCanRequestWithdrawal] = useState(true);

  // Récupérer les données
  const fetchData = async () => {
    try {
      const [balanceData, transactionsData, requestsData] = await Promise.all([
        getBalance(),
        getTransactions(),
        getWithdrawalRequests()
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setWithdrawalRequests(requestsData);

      // Vérifier s'il y a une demande en attente
      const hasPendingRequest = requestsData.some(r => r.status === 'pending');
      setCanRequestWithdrawal(!hasPendingRequest);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const getBalance = async (): Promise<Balance> => {
    const soldeRef = doc(firebasestore, "solde", "total");
    const soldeDoc = await getDoc(soldeRef);

    if (soldeDoc.exists()) {
      return {
        amount: soldeDoc.data().amount || 0,
        availableAmount: soldeDoc.data().availableAmount || 0,
        pendingAmount: soldeDoc.data().pendingAmount || 0,
        currency: "dt"
      };
    }
    return { amount: 0, availableAmount: 0, pendingAmount: 0, currency: "dt" };
  };

  const getTransactions = async (): Promise<Transaction[]> => {
    const ordersSnapshot = await getDocs(collection(firebasestore, "Orders"));
    const transactionsList: Transaction[] = [];

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const clientRef = doc(firebasestore, "clients", orderData.client);
      const clientDoc = await getDoc(clientRef);
      
      const createdAt = orderData.createdAt instanceof Timestamp
        ? orderData.createdAt.toDate()
        : new Date();

      transactionsList.push({
        id: orderDoc.id,
        customerName: clientDoc.exists() ? clientDoc.data().name : "Client inconnu",
        amount: orderData.totalAmount || 0,
        packageCount: orderData.quantity || 0,
        status: orderData.status || "En cours",
        paymentMethod: orderData.paymentMethod || "Espèces",
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    }

    return transactionsList;
  };

  const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
    const snapshot = await getDocs(collection(firebasestore, "withdrawalRequests"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      amount: doc.data().amount,
      status: doc.data().status,
      paymentMethod: doc.data().paymentMethod || "Virement",
      createdAt: doc.data().createdAt.toDate()
    }));
  };

  const canRequestWithdrawalCheck = async (): Promise<boolean> => {
    const snapshot = await getDocs(collection(firebasestore, "withdrawalRequests"));
    const pendingRequests = snapshot.docs.filter(doc => 
      doc.data().status === "pending"
    );
    return pendingRequests.length === 0;
  };

  const requestPendingWithdrawal = async (paymentMethod: "Espèces" | "Virement") => {
    try {
      const canRequest = await canRequestWithdrawalCheck();
      
      if (!canRequest) {
        Alert.alert("Erreur", "Vous avez déjà une demande en attente");
        setCanRequestWithdrawal(false);
        return;
      }
      
      if (balance.pendingAmount <= 0) {
        Alert.alert("Erreur", "Aucun montant disponible pour le versement");
        return;
      }

      await addDoc(collection(firebasestore, "withdrawalRequests"), {
        amount: balance.pendingAmount,
        status: "pending",
        paymentMethod,
        createdAt: Timestamp.now()
      });

      Alert.alert("Succès", `Demande de versement par ${paymentMethod.toLowerCase()} envoyée`);
      setCanRequestWithdrawal(false);
      fetchData();
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  const showPaymentMethodDialog = () => {
    Alert.alert(
      "Mode de versement",
      "Choisissez le mode de versement:",
      [
        {
          text: "Espèces",
          onPress: () => requestPendingWithdrawal("Espèces"),
        },
        {
          text: "Virement",
          onPress: () => requestPendingWithdrawal("Virement"),
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    Animated.timing(animation, {
      toValue: modalVisible ? 0 : 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(3).replace('.', ',');
  };

  const PaymentMethodBadge = ({ method }: { method: "Espèces" | "Virement" }) => (
    <View style={[styles.badge, method === "Espèces" ? styles.cashBadge : styles.transferBadge]}>
      <Text style={styles.badgeText}>{method}</Text>
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
            Demandé le: {request.createdAt.toLocaleDateString()} à {request.createdAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.cashBox}>
        <Text style={styles.cashTitle}>Ma Caisse</Text>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash Disponible</Text>
          <Text style={styles.cashValueBlue}>{formatAmount(balance.availableAmount)} {balance.currency}</Text>
        </View>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash non Disponible</Text>
          <Text style={styles.cashValue}>{formatAmount(balance.pendingAmount)} dt</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cashRow}>
          <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
          <Text style={[styles.cashValue, styles.bold]}>{formatAmount(balance.amount)} {balance.currency}</Text>
        </View>

        <TouchableOpacity onPress={toggleModal}>
          <View style={styles.bottomBar} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.expandedCashBox, { 
            transform: [{ 
              translateY: animation.interpolate({ 
                inputRange: [0, 1], 
                outputRange: [400, 0] 
              }) 
            }] 
          }]}>
            <ScrollView>
              <Text style={styles.cashTitle}>Ma Caisse</Text>
              
              <View style={styles.cashRow}>
                <Text style={styles.cashLabel}>Cash Disponible</Text>
                <Text style={styles.cashValueBlue}>{formatAmount(balance.availableAmount)} {balance.currency}</Text>
              </View>
              <View style={styles.cashRow}>
                <Text style={styles.cashLabel}>Cash non Disponible</Text>
                <Text style={styles.cashValue}>{formatAmount(balance.pendingAmount)} dt</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.cashRow}>
                <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
                <Text style={[styles.cashValue, styles.bold]}>{formatAmount(balance.amount)} {balance.currency}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Demandes de versement</Text>
                {withdrawalRequests.length > 0 ? (
                  withdrawalRequests.map((request) => (
                    <WithdrawalRequestCard key={request.id} request={request} />
                  ))
                ) : (
                  <Text style={styles.noDataText}>Aucune demande de versement</Text>
                )}

                <TouchableOpacity 
                  style={[
                    styles.button, 
                    (!canRequestWithdrawal || balance.pendingAmount <= 0) && styles.disabledButton
                  ]} 
                  onPress={showPaymentMethodDialog}
                  disabled={!canRequestWithdrawal || balance.pendingAmount <= 0}
                >
                  <Text style={styles.buttonText}>
                    {canRequestWithdrawal 
                      ? `Demander versement (${formatAmount(balance.pendingAmount)} dt)`
                      : "Demande déjà envoyée"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transactions récentes</Text>
                {transactions.slice(0, 5).map((transaction) => (
                  <View key={transaction.id} style={styles.transactionRow}>
                    <View style={styles.transactionDot} />
                    <Text style={styles.transactionAmount}>{transaction.amount.toFixed(3)} dt</Text>
                    <PaymentMethodBadge method={transaction.paymentMethod} />
                    <Text style={styles.transactionDate}>{transaction.date} {transaction.time}</Text>
                  </View>
                ))}

                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => {
                    toggleModal();
                    navigation.navigate("Caisse");
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Voir toutes les transactions</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cashBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cashTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  cashLabel: {
    color: '#666',
    fontSize: 14,
  },
  cashValueBlue: {
    color: '#877DAB',
    fontSize: 14,
    fontWeight: '600',
  },
  cashValue: {
    color: '#111',
    fontSize: 14,
  },
  bold: {
    fontWeight: '700',
  },
  divider: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  bottomBar: {
    width: 60,
    height: 5,
    backgroundColor: '#A7A9B7',
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  expandedCashBox: {
    backgroundColor: '#fff',
    height: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 29,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#574599',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#574599',
  },
  secondaryButtonText: {
    color: '#574599',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#877DAB',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#877DAB',
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    width: 80,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  requestCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  requestAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  cashBadge: {
    backgroundColor: '#54E598',
  },
  transferBadge: {
    backgroundColor: '#7B61FF',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CashBox;