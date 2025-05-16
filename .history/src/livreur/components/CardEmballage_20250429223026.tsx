import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { updateEmballageStatus } from '../services/EmballageService';
interface Props {
  emballage: {
    id: string;
    size: string;
    quantity: number;
    price: number;
    totalPrice: number;
    userInfo: {
      email: string;
      name: string;
    };
    addressInfo: {
      fullAddress: string;
    };
    date?: string;
  };
  onRefresh: () => void;
}

const CardEmballage: React.FC<Props> = ({ emballage, onRefresh }) => {
  const handleLivrer = async () => {
    await updateEmballageStatus(emballage.id, "en cours");
    onRefresh();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Commande #{emballage.id.slice(0, 8)}</Text>
          
          <View style={styles.detailContainer}>
            <Text style={styles.orderText}>Taille: {emballage.size}</Text>
            <Text style={styles.orderText}>Quantité: {emballage.quantity}</Text>
            <Text style={styles.orderText}>Prix total: {emballage.totalPrice.toFixed(3)} dt</Text>
            <Text style={styles.orderText}>Adresse: {emballage.addressInfo.fullAddress}</Text>
            <Text style={styles.orderText}>Client: {emballage.userInfo.name}</Text>
            {emballage.date && <Text style={styles.orderText}>Date: {emballage.date}</Text>}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLivrer}>
        <Text style={styles.buttonText}>Je livre</Text>
      </TouchableOpacity>
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
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#877DAB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CardEmballage;