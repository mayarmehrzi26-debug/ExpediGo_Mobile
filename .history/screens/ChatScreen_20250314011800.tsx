import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Charger les messages à partir d'une source de données (peut être une API ou une base de données)
    const initialMessages = [
      {
        _id: 1,
        text: 'Bonjour, comment puis-je vous aider ?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Support',
        },
      },
    ];
    setMessages(initialMessages);
  }, []);

  const onSend = (newMessages = []) => {
    setMessages(GiftedChat.append(messages, newMessages));
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: 1, // Utilisateur connecté
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