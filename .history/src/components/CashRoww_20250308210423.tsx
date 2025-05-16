import React from "react";
import { StyleSheet, Text, View } from "react-native";

// CashRow Component
interface CashRowProps {
  label: string;
  value: string;
  isPurple?: boolean;
}

const CashRow: React.FC<CashRowProps> = ({
  label,
  value,
  isPurple = false,
}) => {
  return (
    <View style={styles.cashRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isPurple && styles.purpleValue]}>
        {value}
      </Text>
    </View>
  );
};

// CashCard Component
interface CashCardProps {
  availableCash: string;
  unavailableCash: string;
  totalCash: string;
}

const CashCard: React.FC<CashCardProps> = ({
  availableCash,
  unavailableCash,
  totalCash,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <CashRow label="Cash Disponible" value={`${availableCash} dt`} isPurple />
        <CashRow label="Cash non Disponible" value={`${unavailableCash} dt`} />
        <CashRow label="Total" value={`${totalCash} dt`} />
      </View>
    </View>
  );
};

// BottomBar Component
const BottomBar: React.FC = () => {
  return (
    <View style={styles.bottomBar} />
  );
};

// Main Page Component
const CashRoww = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ma Caisse</Text>

      <CashCard
        availableCash="0,000"
        unavailableCash="115,000"
        totalCash="115,000"
      />

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7', // Assurez-vous de définir votre couleur d'arrière-plan
  },
  header: {
    fontSize: 19,
    fontWeight: 'normal',
    color: '#27251F',
    width: '90%',
    textAlign: 'center',
  },
  card: {
    width: 361,
    height: 145,
    backgroundColor: 'white',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    elevation: 4,
    marginBottom: 10,
  },
  cardContent: {
    padding: 17,
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#27251F',
  },
  value: {
    fontSize: 14,
    color: '#27251F',
  },
  purpleValue: {
    color: '#6B46C1', // Couleur violette
  },
  bottomBar: {
    width: 60,
    height: 5,
    backgroundColor: '#A7A9B7',
    borderRadius: 10,
    marginTop: 3,
  },
});

export default CashRoww;