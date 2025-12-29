import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firebasestore } from '../../../FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

interface HistoryItem {
  id: string;
  action: string;
  performedBy: string;
  timestamp: any;
  details: any;
}

const HistoryScreen = ({ route }) => {
  const { commandeId } = route.params;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyRef = collection(firebasestore, "livraisons", commandeId, "history");
        const q = query(historyRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoryItem[];
        
        setHistory(historyData);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [commandeId]);

  const getActionIcon = (action: string) => {
    if (action.includes("pickup")) return "local-shipping";
    if (action.includes("livraison")) return "delivery-dining";
    if (action.includes("Statut")) return "sync";
    return "history";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Date inconnue";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique de la commande #{commandeId}</Text>
      
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Aucun historique disponible</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={getActionIcon(item.action)} 
                  size={24} 
                  color="#44076a" 
                />
              </View>
              
              <View style={styles.content}>
                <Text style={styles.actionText}>{item.action}</Text>
                <Text style={styles.detailsText}>
                  Effectué par: {item.performedBy}
                </Text>
                <Text style={styles.dateText}>
                  {formatDate(item.timestamp)}
                </Text>
                
                {item.details && Object.keys(item.details).length > 0 && (
                  <View style={styles.detailsContainer}>
                    {Object.entries(item.details).map(([key, value]) => (
                      <Text key={key} style={styles.detailText}>
                        {key}: {String(value)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  detailsContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
});

export default HistoryScreen;