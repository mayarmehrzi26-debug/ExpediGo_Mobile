// src/features/home/components/HomeStats.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HomePresenter } from '../../presenters/HomePresenter';
import { Stats } from '../../redux/homeTypes';

interface HomeStatsProps {
  stats: Stats;
  presenter: HomePresenter;
}

const HomeStats: React.FC<HomeStatsProps> = ({ stats, presenter }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistiques</Text>
      
      <View style={styles.statContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.deliveries}</Text>
          <Text style={styles.statLabel}>Livraisons</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pickups}</Text>
          <Text style={styles.statLabel}>Pickups</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {presenter.formatRevenue(stats.revenue)}
          </Text>
          <Text style={styles.statLabel}>Revenu</Text>
        </View>
      </View>
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
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeStats;