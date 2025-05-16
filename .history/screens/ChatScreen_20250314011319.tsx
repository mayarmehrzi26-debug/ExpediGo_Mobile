import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { firestore } from '../FirebaseConfig'; // Assurez-vous que le chemin est correct

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = collection(firestore, 'messages');

    // Écouter les messages en temps réel
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (newMessage) => {
    const message = newMessage[0];
    await addDoc(collection(firestore, 'messages'), {
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={newMessage => sendMessage(newMessage)}
        user={{
          _id: 1, // Remplacez par l'ID de l'utilisateur réel
          name: 'User Name', // Remplacez par le nom de l'utilisateur réel
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});