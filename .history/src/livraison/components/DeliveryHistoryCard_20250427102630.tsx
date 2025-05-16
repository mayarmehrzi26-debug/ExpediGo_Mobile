import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DeliveryHistoryCard = ({ id, client, address, status, date, product, totalAmount }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Livré': return '#4CAF50';
      case 'Annulée': return '#F44336';
      case 'En cours': return '#2196F3';
      default: return '#FFC107';
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.id}>Commande #{id.substring(0, 6)}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      
      <Text style={styles.client}>{client}</Text>
      <Text style={styles.address}>{address}</Text>
      
      <View style={styles.details}>
        <Text style={styles.product}>{product}</Text>
        <Text style={styles.amount}>{totalAmount} €</Text>
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#A7A9B7',
  },
  client: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  product: {
    fontSize: 14,
    color: '#555',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#877DAB',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 5,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DeliveryHistoryCard;