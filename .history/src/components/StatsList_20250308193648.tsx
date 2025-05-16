import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface StatItem {
  title: string;
  thisMonth?: number;
  total: number;
  icon: any; // Utilisez `any` pour les images locales ou les URLs
}

const StatsList: React.FC = () => {
  const stats: StatItem[] = [
    {
      title: 'Colis livré',
      thisMonth: 20,
      total: 30,
      icon: require('../assets/livré.png'), // Utilisez require pour les images locales
    },
    {
      title: 'En cours de livraison',
      total: 25,
      icon: require('../assets/encours.png'),
    },
    {
      title: 'Retour provisoire',
      total: 5,
      icon: require('../assets/retourprev.png'),
    },
    {
      title: 'En vérification',
      total: 2,
      icon: require('../../assets/enverif.png'),
    },
    {
      title: 'Pick-Ups assuré',
      thisMonth: 10,
      total: 25,
      icon: require('../../assets/pickupAssuré.png'),
    },
    {
      title: 'Nouveaux Pick-Ups',
      total: 20,
      icon: require('../../assets/newPickups.png'),
    },
    {
      title: 'Retour définitif',
      thisMonth: 0,
      total: 5,
      icon: require('../assets/retourDef.png'),
    },
    {
      title: 'Retour prêt',
      thisMonth: 0,
      total: 8,
      icon: require('../assets/retourPret.png'),
    },
  ];

  return (
    <View style={styles.statsContainer}>
      {stats.map((item, index) => {
        const thisMonth = item.thisMonth !== undefined ? item.thisMonth : 0;
        return (
          <View key={index} style={styles.statCard}>
            <Image
              source={typeof item.icon === 'string' ? { uri: item.icon } : item.icon}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statTitle}>{item.title}</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ce mois</Text>
              <Text style={styles.statValue}>{thisMonth}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{item.total}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  statIcon: {
    width: 80,
    height: 40,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
  },
});

export default StatsList;