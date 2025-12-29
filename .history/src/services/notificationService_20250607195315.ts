import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, getDoc,collection, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firebasestore } from '../../FirebaseConfig';

// Configurez les notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async (userId: string) => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  // Enregistrez le token dans Firestore
  if (userId) {
    const userRef = doc(firebasestore, 'users', userId);
    
    // Vérifiez d'abord si le document existe
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Créez le document s'il n'existe pas
      await setDoc(userRef, {
        fcmToken: token,
        notifications: [],
        unreadNotificationCount: 0,
        createdAt: new Date()
      });
    } else {
      // Mettez à jour seulement le token si le document existe
      await updateDoc(userRef, {
        fcmToken: token
      });
    }
  }

  return token;
};

export const sendPushNotification = async (
  userIds: string[],
  title: string,
  body: string,
  data: any = {}
) => {
  try {
    // Récupérer les tokens FCM pour chaque utilisateur
    const tokens = await Promise.all(
      userIds.map(async (userId) => {
        const userDoc = await getDoc(doc(firebasestore, "users", userId));
        return userDoc.exists() ? userDoc.data()?.fcmToken : null;
      })
    );

    // Filtrer les tokens valides
    const validTokens = tokens.filter(token => token);

    // Envoyer les notifications push
    await Promise.all(
      validTokens.map(token => 
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            title,
            body,
            data,
            sound: 'default',
          }),
        })
      )
    );

    // Stocker les notifications dans une collection séparée
    const notificationsRef = collection(firebasestore, 'notifications');
    const notificationData = {
      title,
      body,
      data,
      userIds, // Liste des utilisateurs concernés
      readBy: [], // Liste des utilisateurs qui ont lu la notification
      createdAt: serverTimestamp(),
    };

    await addDoc(notificationsRef, notificationData);

  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Fonction pour récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(firebasestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Fonction pour marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notificationRef = doc(firebasestore, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};
// Helper function for Firestore increment
const increment = (value: number) => ({
  increment: value
});