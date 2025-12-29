import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getCommandHistory } from '../services/commandeService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HistoryScreen = ({ route }) => {
  const { commandeId } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await getCommandHistory(commandeId);
        setHistory(historyData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [commandeId]);

  const getActionIcon = (action) => {
    if (action.includes('pickup')) return 'local-shipping';
    if (action.includes('livraison')) return 'delivery-dining';
    if (action.includes('Livré')) return 'check-circle';
    if (action.includes('Retour')) return 'assignment-return';
    return 'history';
  };

  const formatDate = (date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement de l'historique...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historique de la commande #{commandeId}</Text>
      
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Aucun historique disponible</Text>
      ) : (
        history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <MaterialIcons 
              name={getActionIcon(item.action)} 
              size={24} 
              color="#44076a" 
              style={styles.icon}
            />
            <View style={styles.historyContent}>
              <Text style={styles.actionText}>{item.action}</Text>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              <Text style={styles.userText}>
                Par {item.userRole} ({item.userId})
              </Text>
              {item.details && (
                <Text style={styles.detailsText}>
                  Détails: {JSON.stringify(item.details)}
                </Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#44076a',
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  userText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  detailsText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default HistoryScreen;