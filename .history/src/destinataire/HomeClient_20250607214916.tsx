import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { arrayUnion,serverTimestamp, collection, doc, getDoc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { firebaseAuth, firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import NavBottomClient from "../../src/components/shared/NavBottomClient";
import BarcodeScanner from '../components/BarcodeScanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeClient'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Configurez les notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animation du bouton scanner
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Enregistrer le token FCM
  const registerForPushNotifications = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      const user = firebaseAuth.currentUser;

      if (user) {
        await updateDoc(doc(firebasestore, 'users', user.uid), {
          fcmToken: token,
          updatedAt: serverTimestamp()
        });
      }

      // Configuration du canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Récupérer les notifications
  const fetchNotifications = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        // Récupérer depuis la collection globale
        const globalQuery = query(
          collection(firebasestore, 'notifications'),
          where('userIds', 'array-contains', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const globalSnapshot = await getDocs(globalQuery);
        const globalNotifications = globalSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          data: doc.data().data,
          read: doc.data().readBy?.includes(user.uid) || false,
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Récupérer depuis la sous-collection utilisateur
        const userQuery = query(
          collection(firebasestore, `users/${user.uid}/notifications`),
          orderBy('timestamp', 'desc')
        );
        
        const userSnapshot = await getDocs(userQuery);
        const userNotifications = userSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          data: doc.data().data,
          read: doc.data().read || false,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        // Fusionner et trier les notifications
        const allNotifications = [...globalNotifications, ...userNotifications]
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setNotificationsList(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string, isGlobal: boolean) => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        if (isGlobal) {
          await updateDoc(
            doc(firebasestore, 'notifications', notificationId),
            { readBy: arrayUnion(user.uid) }
          );
        } else {
          await updateDoc(
            doc(firebasestore, `users/${user.uid}/notifications`, notificationId),
            { read: true }
          );
        }

        // Mettre à jour l'état local
        setNotificationsList(prev => 
          prev.map(n => n.id === notificationId ? {...n, read: true} : n)
        );
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        // Marquer les notifications globales
        const unreadGlobal = notificationsList
          .filter(n => !n.read && n.id.includes('global'));
        
        await Promise.all(
          unreadGlobal.map(notif => 
            updateDoc(
              doc(firebasestore, 'notifications', notif.id),
              { readBy: arrayUnion(user.uid) }
            )
          )
        );

        // Marquer les notifications utilisateur
        const unreadUser = notificationsList
          .filter(n => !n.read && !n.id.includes('global'));
        
        await Promise.all(
          unreadUser.map(notif => 
            updateDoc(
              doc(firebasestore, `users/${user.uid}/notifications`, notif.id),
              { read: true }
            )
          )
        );

        // Mettre à jour l'état
        setNotificationsList(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Setup des notifications au montage
  useEffect(() => {
    registerForPushNotifications();
    fetchNotifications();

    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      fetchNotifications(); // Actualiser les notifications
    });

    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        navigation.navigate(data.screen);
      }
    });

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, []);

  const toggleCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setCameraVisible(true);
    } else {
      alert("Permission pour accéder à la caméra refusée.");
    }
  };

  const searchOrderByTrackingCode = async () => {
    if (!trackingCode) {
      alert("Veuillez entrer un code de suivi.");
      return;
    }

    try {
      const orderRef = doc(firebasestore, "livraisons", trackingCode);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        navigation.navigate('PackageDetails', { scannedData: trackingCode });
      } else {
        alert("Aucune commande trouvée avec ce code de suivi.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la commande : ", error);
      alert("Une erreur s'est produite lors de la recherche de la commande.");
    }
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
                    markAsRead(notif.id, notif.id.includes('global'));
                    if (notif.data?.screen) {
                      navigation.navigate(notif.data.screen);
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
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllAsReadText}>Marquer tout comme lu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.mainContainer}>
      {cameraVisible ? (
        <View style={styles.fullScreenCameraContainer}>
          <BarcodeScanner onClose={() => setCameraVisible(false)} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/expedigo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <TouchableOpacity 
                onPress={() => setNotificationsVisible(true)}
                style={styles.notificationIcon}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={24} 
                  color="#F7F7F7" 
                />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.scannerTitle}>Scanner code QR</Text>

            <View style={styles.scanner}>
              <TouchableOpacity onPress={toggleCamera}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={150}
                    color="#27251F"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.orText}>OR</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Entrez le numéro de commande..."
                placeholderTextColor="#A7A9B7"
                value={trackingCode}
                onChangeText={setTrackingCode}
                returnKeyType="search"
                onSubmitEditing={searchOrderByTrackingCode}
              />
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={searchOrderByTrackingCode}
              >
                <Ionicons name="search" size={20} color="#A7A9B7" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.packageImageContainer}>
              <Image 
                source={require("../../assets/img.png")}
                style={styles.packageImage} 
                resizeMode="contain"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      
      {/* NavBottom toujours fixe en bas */}
      {!cameraVisible && (
        <View style={styles.navBottomContainer}>
          <NavBottomClient />
        </View>
      )}

      <NotificationsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenCameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#877DAB",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
  },
  navBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logo: {
    width: 125,
    height: 60,
  },
  notificationIcon: {
    marginTop: 6,
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
  scannerTitle: {
    marginTop: 32,
    fontSize: 30,
    color: '#27251F',
    textAlign: 'center',
    fontWeight: "bold",
  },
  scanner: {
    alignItems: "center",
    paddingTop: 40,
  },
  orText: {
    color: "#fff",
    alignSelf: "center",
    paddingTop: 30,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    paddingHorizontal: 18,
    marginHorizontal: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: "#27251F",
    paddingVertical: 12,
  },
  searchButton: {
    padding: 8,
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  packageImage: {
    width: 330,
    height: 280,
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
});

export default HomeClient;