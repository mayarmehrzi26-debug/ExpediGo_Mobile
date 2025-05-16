import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  emballage: {
    id: string;
    size: string;
    quantity: number;
    price: number;
    totalPrice: number;
    status: string;
    userInfo: {
      email: string;
      displayName: string;
    };
    addressInfo: {
      fullAddress: string;
    };
    date?: string;
  };
  onRefresh: () => void;
}

const CardEmballage: React.FC<Props> = ({ emballage }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Commande #{emballage.id}</Text>          
          <View style={styles.detailContainer}>
            <Text style={styles.orderText}>Taille: {emballage.size}</Text>
            <Text style={styles.orderText}>Quantité: {emballage.quantity}</Text>
            <Text style={styles.orderText}>Prix total: {emballage.totalPrice.toFixed(3)} dt</Text>
            <Text style={styles.orderText}>Destination: {emballage.addressInfo.fullAddress}</Text>
            <Text style={styles.orderText}>Statut: {emballage.status}</Text>
            {emballage.date && <Text style={styles.orderText}>Date: {emballage.date}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1EEFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
    color: '#877DAB',
    marginBottom: 8,
  },
  detailContainer: {
    marginVertical: 8,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },
});

export default CardEmballage;