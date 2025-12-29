import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, getDoc,updateDoc } from 'firebase/firestore';
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
    await updateDoc(userRef, {
      fcmToken: token,
    });
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
        const userDoc = await getDoc(doc(firebasestore, 'users', userId));
        return userDoc.data()?.fcmToken;
      })
    );

    // Filtrer les tokens valides
    const validTokens = tokens.filter(token => token);

    // Envoyer les notifications
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
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};