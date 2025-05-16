import React, { useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CashBoxProps {
  availableCash: string;
  unavailableCash: string;
  totalCash: string;
}

const CashBox: React.FC<CashBoxProps> = ({ availableCash, unavailableCash, totalCash }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0)); // Animation pour la transition
  const [modalVisible, setModalVisible] = useState(false); // Pour afficher la modal

  const toggleExpansion = () => {
    setModalVisible(true); // Ouvrir la modal
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      {/* Carte principale */}
      <View style={styles.cashBox}>
        <Text style={styles.cashTitle}>Ma Caisse</Text>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash Disponible</Text>
          <Text style={styles.cashValueBlue}>{availableCash}</Text>
        </View>
        <View style={styles.cashRow}>
          <Text style={styles.cashLabel}>Cash non Disponible</Text>
          <Text style={styles.cashValue}>{unavailableCash}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cashRow}>
          <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
          <Text style={[styles.cashValue, styles.bold]}>{totalCash}</Text>
        </View>

        {/* Barre inférieure pour ouvrir la modal */}
        <TouchableOpacity onPress={toggleExpansion}>
          <View style={styles.bottomBar} />
        </TouchableOpacity>
      </View>

      {/* Modal pour afficher la CashBox en plein écran */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.expandedCashBox, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}>
            <Text style={styles.cashTitle}>Ma Caisse</Text>
            <View style={styles.cashRow}>
              <Text style={styles.cashLabel}>Cash Disponible</Text>
              <Text style={styles.cashValueBlue}>{availableCash}</Text>
            </View>
            <View style={styles.cashRow}>
              <Text style={styles.cashLabel}>Cash non Disponible</Text>
              <Text style={styles.cashValue}>{unavailableCash}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cashRow}>
              <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
              <Text style={[styles.cashValue, styles.bold]}>{totalCash}</Text>
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

              {/* Section des transactions */}
              <View style={styles.transactionSection}>
                <Text style={styles.sectionTitle}>Transactions récentes</Text>

                {transactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionRow}>
                    <View style={styles.transactionDot} />
                    <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styles.button} onPress={() => console.log('Voir plus de transactions')}>
                  <Text style={styles.buttonText}>Voir plus</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bouton pour fermer la modal */}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const transactions = [
  { amount: '+50,000 dt', date: '05/02/2024' },
  { amount: '-20,000 dt', date: '06/02/2024' },
];

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
  button: {
    backgroundColor: '#54E598',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
    marginLeft: 206,

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
