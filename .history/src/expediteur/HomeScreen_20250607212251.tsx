import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { collection,arrayUnion,orderBy, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { G, Path } from "react-native-svg";
import { firebaseAuth, firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import BarcodeScanner from '../../screens/BarcodeScanner';
import CashBox from '../../src/components/CashBox';
import StatsList from '../../src/components/StatsList';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const MoneyBagIcon = (props) => (
  <Svg
    fill="none"
    height={30}
    viewBox="0 0 48 48"
    width={48}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipRule="evenodd" fill="#333" fillRule="evenodd">
      <Path d="m24.0433 4c-5.0184 0-9.5915 1.65746-12.2964 3.01231-.2438.12208-.4723.24171-.6847.35744-.4202.22903-.777.44281-1.0622.63025l3.0777 4.5307 1.4486.5767c5.6626 2.8571 13.2562 2.8571 18.9188 0l1.6449-.8534 2.91-4.254c-.4264-.2843-1.0162-.62922-1.7419-.99597-.0442-.02236-.0889-.04479-.1342-.0673-2.6932-1.3401-7.1552-2.93673-12.0806-2.93673zm-7.1581 5.12906c-1.1076-.20435-2.1959-.4862-3.2232-.80957 2.5348-1.12555 6.3123-2.31949 10.3813-2.31949 2.8193 0 5.4849.57325 7.6897 1.2991-2.5838.36474-5.3411.98045-7.9676 1.74029-2.0667.59788-4.4825.53208-6.8802.08967z" />
      <Path d="m34.6185 14.7556-.2724.1374c-6.2293 3.143-14.4915 3.143-20.7207 0l-.259-.1306c-9.35732 10.268-19.17397 29.5229 10.6769 29.2344 29.8304-.2883 19.86-19.3207 10.5752-29.2412zm-8.9072 7.2444h-3.4226v1.6c-1.1122-.0026-2.1816.3999-2.9819 1.1222-.8001.7221-1.268 1.7072-1.3045 2.7465s.3613 2.051 1.109 2.8207c.7478.7697 1.7868 1.2369 2.8968 1.3026l.2806.008h3.4226l.154.0128c.1973.0334.3758.1305.5043.2744.1285.1438.199.3254.199.5128s-.0705.369-.199.5128c-.1285.1439-.307.241-.5043.2744l-.154.0128h-6.8452v3.2h3.4226v1.6h3.4226v-1.6c1.1122.0026 2.1816-.3999 2.9819-1.1222.8001-.7221 1.268-1.7072 1.3045-2.7465s-.3613-2.051-1.109-2.8207c-.7478-.7697-1.7868-1.2369-2.8968-1.3026l-.2806-.008h-3.4226l-.154-.0128c-.1973-.0334-.3758-.1305-.5043-.2744-.1285-.1438-.199-.3254-.199-.5128s.0705-.369.199-.5128c.1285-.1439.307-.241.5043-.2744l.154-.0128h6.8452v-3.2h-3.4226z" />
    </G>
  </Svg>
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Array<{
    id: string;
    title: string;
    body: string;
    data?: any;
    read: boolean;
    timestamp: Date;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const updates = [
    { date: '05/02/2025', name: 'Mayar Mehrzi', phone: '72737272' },
    { date: '06/02/2025', name: 'Mayar Mehrzi', phone: '72737272' },
  ];

  const registerFCMToken = async (userId: string, token: string) => {
    try {
      await updateDoc(doc(firebasestore, 'users', userId), {
        fcmToken: token,
      });
      console.log('Token FCM enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
    }
  };

  const fetchNotifications = async () => {
  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      // Récupérer les notifications où l'utilisateur est dans le tableau userIds
      const notificationsSnapshot = await getDocs(
        query(
          collection(firebasestore, 'notifications'),
          where('userIds', 'array-contains', user.uid),
          orderBy('createdAt', 'desc')
        )
      );
      
      const notifications = notificationsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          data: doc.data().data,
          read: doc.data().readBy?.includes(user.uid) || false,
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        }));
        
      setNotificationsList(notifications);
      
      // Mettre à jour le compteur de notifications non lues
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

  const fetchUnreadCount = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        const snapshot = await getDocs(
          query(
            collection(firebasestore, `users/${user.uid}/notifications`),
            where('read', '==', false)
          )
        );
        setUnreadCount(snapshot.size);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleShowNotifications = async () => {
    await fetchNotifications();
    setNotificationsVisible(true);
  };

 const markAsRead = async (notificationId: string) => {
  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      await updateDoc(
        doc(firebasestore, 'notifications', notificationId),
        { readBy: arrayUnion(user.uid) }
      );
      
      // Mettre à jour la liste locale
      setNotificationsList(prev => 
        prev.map(n => n.id === notificationId ? {...n, read: true} : n)
      );
      
      // Mettre à jour le compteur
      setUnreadCount(prev => prev - 1);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

  const handleMarkAllAsRead = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        const batch = writeBatch(firebasestore);
        
        notificationsList
          .filter(notif => !notif.read)
          .forEach(notif => {
            const notifRef = doc(firebasestore, `users/${user.uid}/notifications`, notif.id);
            batch.update(notifRef, { read: true });
          });
          
        await batch.commit();
        
        // Mettre à jour l'état local
        setNotificationsList(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        
        // Réinitialiser le compteur
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Vous ne recevrez pas de notifications');
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
        
        const user = firebaseAuth.currentUser;
        if (user) {
          await registerFCMToken(user.uid, token);
        }

        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (error) {
        console.error('Erreur lors de la configuration des notifications:', error);
      }
    };

    setupNotifications();
    fetchUnreadCount();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      fetchUnreadCount(); // Actualiser le compteur quand une nouvelle notification arrive
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'ticket_response') {
        navigation.navigate('Support', { 
          ticketId: data.ticketId 
        });
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
  };

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  const NotificationsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={notificationsVisible}
      onRequestClose={() => setNotificationsVisible(false)}
    >
      <View style={styles.notificationsModal}>
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setNotificationsVisible(false)}>
              <Ionicons name="close" size={24} color="#877DAB" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {notificationsList.length > 0 ? (
              notificationsList.map((notif) => (
                <TouchableOpacity 
                  key={notif.id} 
                  onPress={() => {
                    markAsRead(notif.id);
                    if (notif.data?.type === 'ticket_response') {
                      navigation.navigate('Support');
                    }
                    setNotificationsVisible(false);
                  }}
                >
                  <View style={[
                    styles.notificationItem,
                    !notif.read && styles.unreadNotification,
                  ]}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    <Text style={styles.notificationBody}>{notif.body}</Text>
                    <Text style={styles.notificationDate}>
                      {notif.timestamp.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    {!notif.read && (
                      <View style={styles.unreadBadge} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noNotificationsText}>Aucune notification</Text>
            )}
          </ScrollView>
          
          {notificationsList.length > 0 && (
            <TouchableOpacity 
              style={styles.markAllAsReadButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllAsReadText}>Marquer tout comme lu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerContainer1}>
              <TouchableOpacity onPress={toggleCamera}>
                <MaterialIcons
                  name="qr-code-scanner"
                  size={24}
                  color="black"
                  style={{ marginLeft: 110 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('CashView')}>
                <MoneyBagIcon />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShowNotifications} 
                style={styles.notificationIcon}
              >
                <Ionicons name="notifications-outline" size={24} color="black" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <CashBox />
            <StatsList />

            <Text style={styles.updateTitle}>Mises à jour</Text>
            {updates.map((item, index) => (
              <View key={index} style={styles.updateBox}>
                <Text style={styles.updateDate}>{item.date}</Text>
                <Text style={styles.updateName}>{item.name}</Text>
                <Text style={styles.updatePhone}>{item.phone}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Livraison')}
            >
              <Ionicons name="cube-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Livraisons</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Chatbot')}
            >
              <MaterialCommunityIcons name="robot-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Chatbot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.floatingButton} onPress={toggleButtonMode}>
              <Ionicons name={isAddMode ? 'add' : 'close'} size={54} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Support')}
            >
              <Ionicons name="help-circle-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Profil</Text>
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            animationType="fade"
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setIsAddMode(true);
            }}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    setIsAddMode(true);
                    navigation.navigate('EmballageCommand');
                  }}
                >
                  <Text style={styles.modalButtonText}>Commande d'emballage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    setIsAddMode(true);
                    navigation.navigate('NouvelleLivraisonScreen');
                  }}
                >
                  <Text style={styles.modalButtonText}>Nouvelle livraison</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setIsAddMode(true);
              }}
            >
              <Ionicons name="close" size={42} color="white" />
            </TouchableOpacity>
          </Modal>

          <NotificationsModal />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 12
  },
  headerContainer1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 70
  },
  logo: {
    width: 125,
    height: 60,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#877DAB",
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginLeft: 16,
    marginBottom: 8,
  },
  updateBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  updateDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  updateName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#877DAB",
    marginBottom: 2,
  },
  updatePhone: {
    fontSize: 14,
    color: "#333",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
  },
  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  bottomNavText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 393,
  },
  modalButton: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    borderColor: "#877DAB",
    borderWidth: 2,
  },
  modalButtonText: {
    color: "#877DAB",
    fontWeight: "600",
  },
  closeButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    justifyContent: "center",
  },
  notificationsModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notificationsContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#877DAB',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
  unreadNotification: {
    backgroundColor: '#f0f0ff',
    borderLeftWidth: 3,
    borderLeftColor: '#877DAB',
  },
  unreadBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#877DAB',
  },
  markAllAsReadButton: {
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  markAllAsReadText: {
    color: '#877DAB',
    fontWeight: 'bold',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;