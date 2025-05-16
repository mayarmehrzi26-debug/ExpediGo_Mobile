import { useNavigation } from '@react-navigation/native';
import { collection, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
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
} from 'react-native';
import { firebasestore } from '../../FirebaseConfig'; // Ajustez le chemin selon votre structure

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

const CashBox: React.FC = () => {
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState<Balance>({ amount: "0,000", currency: "dt" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Récupérer le solde depuis Firestore
  const fetchBalance = async () => {
    try {
      const soldeRef = doc(firebasestore, "solde", "total");
      const soldeDoc = await getDoc(soldeRef);

      if (soldeDoc.exists()) {
        const amount = soldeDoc.data().amount || 0;
        setBalance({ amount: amount.toFixed(3), currency: "dt" }); // Formater le montant avec 3 décimales
      } else {
        console.log("Aucun solde trouvé dans Firestore.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde :", error);
    }
  };

  // Récupérer les transactions depuis Firestore
  const fetchTransactions = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(firebasestore, "Orders"));
      const transactionsList: Transaction[] = [];

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();

        // Récupérer les informations du client
        const clientRef = doc(firebasestore, "clients", orderData.client);
        const clientDoc = await getDoc(clientRef);
        const clientName = clientDoc.exists() ? clientDoc.data().name : "Client inconnu";

        // Formater la date et l'heure
        const createdAt = orderData.createdAt instanceof Timestamp
          ? orderData.createdAt.toDate()
          : new Date();
        const date = createdAt.toLocaleDateString();
        const time = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        // Ajouter la transaction à la liste
        transactionsList.push({
          customerName: clientName,
          amount: orderData.totalAmount || 0,
          packageCount: orderData.quantity || 0,
          status: orderData.status || "En cours",
          paymentMethod: orderData.paymentMethod || "Espèces",
          date,
          time,
        });
      }

      setTransactions(transactionsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions :", error);
    }
  };

  // Appeler fetchBalance et fetchTransactions au chargement du composant
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const toggleExpansion = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <View style={styles.cashBox}>
        <Text style={styles.cashTitle}>Ma Caisse</Text>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash Disponible</Text>
          <Text style={styles.cashValueBlue}>{balance.amount} {balance.currency}</Text>
        </View>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash non Disponible</Text>
          <Text style={styles.cashValue}>0,000 dt</Text> {/* Vous pouvez ajuster cette valeur si nécessaire */}
        </View>
        <View style={styles.divider} />
        <View style={styles.cashRow}>
          <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
          <Text style={[styles.cashValue, styles.bold]}>{balance.amount} {balance.currency}</Text>
        </View>

        <TouchableOpacity onPress={toggleExpansion}>
          <View style={styles.bottomBar} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.expandedCashBox, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}>
            <View>
              <Text style={styles.cashTitle}>Ma Caisse</Text>
              <View style={styles.cashRow}>
                <Text style={styles.cashLabel}>Cash Disponible</Text>
                <Text style={styles.cashValueBlue}>{balance.amount} {balance.currency}</Text>
              </View>
              <View style={styles.cashRow}>
                <Text style={styles.cashLabel}>Cash non Disponible</Text>
                <Text style={styles.cashValue}>0,000 dt</Text> {/* Vous pouvez ajuster cette valeur si nécessaire */}
              </View>
              <View style={styles.divider} />
              <View style={styles.cashRow}>
                <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
                <Text style={[styles.cashValue, styles.bold]}>{balance.amount} {balance.currency}</Text>
              </View>

              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.infoText}>
                  Rendez-vous visite pendant les jours suivants pour retirer votre argent:
                </Text>
                <Text style={styles.scheduleText}>Mercredi: De 10:00 vers 15:00</Text>
                <Text style={styles.scheduleText}>Vendredi: De 10:00 vers 15:00</Text>

                <TouchableOpacity style={styles.button} onPress={() => console.log('Demander un versement')}>
                  <Text style={styles.buttonText}>Demander un versement</Text>
                </TouchableOpacity>

                <View style={styles.transactionSection}>
                  <Text style={styles.sectionTitle}>Transactions récentes</Text>

                  {transactions.map((transaction, index) => (
                    <View key={index} style={styles.transactionRow}>
                      <View style={styles.transactionDot} />
                      <Text style={styles.transactionAmount}>{transaction.amount.toFixed(3)} dt</Text>
                      <Text style={styles.transactionDate}>{transaction.date} {transaction.time}</Text>
                    </View>
                  ))}

                  <TouchableOpacity 
                    style={styles.button2} 
                    onPress={() => navigation.navigate("Caisse")}
                  >
                    <Text style={styles.buttonText}>Voir plus</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Fermer</Text>
              </TouchableOpacity>
            </View>
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
    color: '#2563EB',
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
  detailsContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#54E598',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 206,
  },
  button2: {
    backgroundColor: '#54E598',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 276,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    textAlign: 'center',
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  transactionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    marginRight: 8,
  },
  transactionSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    paddingLeft: 222,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default CashBox;