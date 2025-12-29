import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CashPresenter } from '../expediteur/caisse/presenter/CashPresenter'; // Ajustez le chemin

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
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [canRequestWithdrawal, setCanRequestWithdrawal] = useState(true);
  const [presenter, setPresenter] = useState<CashPresenter | null>(null);

  // Initialisation du présentateur
  useEffect(() => {
    const userId = "current-user-id"; // Vous devrez récupérer l'ID de l'utilisateur connecté
    const view = {
      displayBalance: (balance) => {
        setBalance({
          amount: parseFloat(balance.total),
          availableAmount: parseFloat(balance.disponible),
          pendingAmount: parseFloat(balance.enAttente),
          currency: balance.currency
        });
      },
      displayWithdrawalRequests: (requests) => {
        setWithdrawalRequests(requests);
      },
      showError: (msg) => Alert.alert("Erreur", msg),
      showSuccess: (msg) => Alert.alert("Succès", msg),
      setWithdrawalButtonEnabled: setCanRequestWithdrawal,
      showWithdrawalDialog: showWithdrawalDialog,
      showPaymentMethodDialog: showPaymentMethodDialog,
      displayPendingTransactions: () => {}, // Non utilisé dans CashBox
      showTransactionSelectionDialog: () => Promise.resolve([]), // Non utilisé dans CashBox
      displayTransactions: () => {} // Non utilisé dans CashBox
    };
    
    const newPresenter = new CashPresenter(view, userId);
    setPresenter(newPresenter);
    newPresenter.loadData();
  }, []);

  const showPaymentMethodDialog = (): Promise<"Espèces" | "Virement"> => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Mode de versement",
        "Choisissez le mode de versement:",
        [
          {
            text: "Espèces",
            onPress: () => resolve("Espèces"),
          },
          {
            text: "Virement",
            onPress: () => resolve("Virement"),
          },
          {
            text: "Annuler",
            onPress: () => reject(new Error("User cancelled")),
            style: "cancel",
          },
        ]
      );
    });
  };

  const showWithdrawalDialog = (maxAmount: number): Promise<{ amount: number; method: "Espèces" | "Virement" }> => {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        "Demande de versement",
        `Montant maximum: ${maxAmount.toFixed(3)} dt`,
        [
          {
            text: "Annuler",
            onPress: () => reject(new Error("User cancelled")),
            style: "cancel",
          },
          {
            text: "Confirmer",
            onPress: (amountText) => {
              const amount = parseFloat(amountText.replace(',', '.'));
              if (isNaN(amount)) {
                Alert.alert("Erreur", "Veuillez entrer un montant valide");
                return;
              }
              if (amount <= 0 || amount > maxAmount) {
                Alert.alert("Erreur", `Le montant doit être entre 0 et ${maxAmount.toFixed(3)}`);
                return;
              }
              showPaymentMethodDialog()
                .then(method => resolve({ amount, method }))
                .catch(reject);
            }
          }
        ],
        "plain-text",
        "",
        "numeric"
      );
    });
  };

  const requestWithdrawal = async () => {
    if (!presenter) return;
    try {
      const balance = await presenter.model.getBalance();
      const { amount, method } = await showWithdrawalDialog(balance.enAttente);
      await presenter.requestWithdrawal(amount);
      Alert.alert("Succès", `Demande de versement de ${amount.toFixed(3)} dt envoyée`);
      presenter.loadData();
    } catch (error) {
      if (error.message !== "User cancelled") {
        Alert.alert("Erreur", error.message || "Échec de la demande");
      }
    }
  };

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
                  onPress={requestWithdrawal}
                  disabled={!canRequestWithdrawal || balance.pendingAmount <= 0}
                >
                  <Text style={styles.buttonText}>
                    {canRequestWithdrawal 
                      ? `Demander versement (${formatAmount(balance.pendingAmount)} dt)`
                      : "Demande déjà envoyée"}
                  </Text>
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