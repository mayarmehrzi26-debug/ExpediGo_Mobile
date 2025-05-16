// src/features/home/components/HomeUpdates.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Update } from '../../redux/homeTypes';
import { HomePresenter } from '../../presenters/HomePresenter';

interface HomeUpdatesProps {
  updates: Update[];
  presenter: HomePresenter;
}

const HomeUpdates: React.FC<HomeUpdatesProps> = ({ updates, presenter }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mises à jour récentes</Text>
      
      {updates.map((update, index) => (
        <View key={index} style={styles.updateItem}>
          <Text style={styles.updateDate}>
            {presenter.formatDate(update.date)}
          </Text>
          <Text style={styles.updateName}>{update.name}</Text>
          <Text style={styles.updatePhone}>{update.phone}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#574599',
  },
  updateItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  updateDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  updateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  updatePhone: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeUpdates;