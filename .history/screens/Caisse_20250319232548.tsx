import { Entypo } from "@expo/vector-icons";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../FirebaseConfig"; // Assurez-vous d'importer votre configuration Firebase
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

  // État pour le solde
  const [balance, setBalance] = useState<Balance>({ amount: "0,000", currency: "dt" });

  // État pour les transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Récupérer le solde depuis Firestore
  useEffect(() => {
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

    fetchBalance();
  }, []);

  // Récupérer les transactions depuis Firestore
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Récupérer les commandes
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

    fetchTransactions();
  }, []);

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
        <TouchableOpacity onPress={() => console.log("Demander le paiement")} style={styles.ButtonPaymnt}>
          <Text style={styles.ButtonPaymntText}>Demander le paiement</Text>
        </TouchableOpacity>
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
  };

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
      <ScrollView style={styles.content}>
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
    marginLeft: 106,
    width: 160,
  },
  ButtonPaymntText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
  },
});

export default Caisse;