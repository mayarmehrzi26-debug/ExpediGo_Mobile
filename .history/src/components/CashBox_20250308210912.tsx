import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CashBoxProps {
  availableCash: string;
  unavailableCash: string;
  totalCash: string;
}

const CashBox: React.FC<CashBoxProps> = ({ availableCash, unavailableCash, totalCash }) => {
  return (
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
      <View style={styles.bottomBar} />

    </View>
  );
};

const styles = StyleSheet.create({
  cashBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cashTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  cashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  cashLabel: {
    color: "#666",
    fontSize: 14,
  },
  cashValueBlue: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  cashValue: {
    color: "#111",
    fontSize: 14,
  },
  bold: {
    fontWeight: "700",
  },
  divider: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    marginVertical: 8,

  },
  bottomBar: {
    width: 60,
    height: 5,
    backgroundColor: '#A7A9B7',
    borderRadius: 10,
    marginTop: 3,
marginLeft:172,
  },
});

export default CashBox;