import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
    status: string;
    date: string;
    destination: string;
    clientEmail: string;
  };
  onRefresh: () => void;
}

const CardEmballage: React.FC<Props> = ({ emballage, onRefresh }) => {
  const handleLivrer = async () => {
    const success = await updateEmballageStatus(emballage.id, "en cours");
    if (success) {
      onRefresh();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Emballage #{emballage.id}</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Taille:</Text>
        <Text style={styles.value}>{emballage.size}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Quantité:</Text>
        <Text style={styles.value}>{emballage.quantity}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Prix unitaire:</Text>
        <Text style={styles.value}>{emballage.price} €</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>{emballage.totalPrice} €</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Destination:</Text>
        <Text style={styles.value}>{emballage.destination}</Text>
      </View>
      
      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={styles.dateText}>{emballage.date}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.button,
          emballage.status !== "non traité" && styles.disabledButton
        ]} 
        onPress={handleLivrer}
        disabled={emballage.status !== "non traité"}
      >
        <Text style={styles.buttonText}>
          {emballage.status === "non traité" ? "Prendre en charge" : "En cours"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F1EEFF',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#877DAB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: '#555',
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  dateText: {
    marginLeft: 5,
    color: '#555',
  },
  button: {
    backgroundColor: '#877DAB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CardEmballage;