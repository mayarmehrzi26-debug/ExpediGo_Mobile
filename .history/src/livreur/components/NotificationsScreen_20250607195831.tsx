import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
import { firebaseAuth } from '../../../FirebaseConfig';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = firebaseAuth.currentUser?.uid;

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) return;
      
      try {
        const userNotifications = await getUserNotifications(userId);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [userId]);

  const handleNotificationPress = async (notification) => {
    if (!userId) return;
    
    // Marquer comme lue
    if (!notification.readBy?.includes(userId)) {
      await markNotificationAsRead(notification.id, userId);
      setNotifications(prev => prev.map(n => 
        n.id === notification.id 
          ? { ...n, readBy: [...(n.readBy || []), userId] } 
          : n
      ));
    }

    // Naviguer si nécessaire
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#877DAB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#877DAB" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} /> {/* Pour l'alignement */}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.notificationItem,
              !item.readBy?.includes(userId) && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationTime}>
              {item.createdAt?.toLocaleString() || 'Date inconnue'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#877DAB',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  unreadNotification: {
    backgroundColor: '#F0E6FF',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#44076a',
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;