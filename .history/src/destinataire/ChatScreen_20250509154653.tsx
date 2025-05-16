import { useRoute } from '@react-navigation/native';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { firebasestore,firebaseAuth } from '../../FirebaseConfig';

const ChatScreen = () => {
  const route = useRoute();
  const { conversationId, recipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firebasestore, "conversations", conversationId, "messages"),
      (querySnapshot) => {
        const msgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs.sort((a, b) => a.createdAt - b.createdAt));
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
    
    await addDoc(collection(firebasestore, "conversations", conversationId, "messages"), {
      text: newMessage,
      sender: firebaseAuth.currentUser.uid,
      createdAt: new Date(),
      read: false
    });
    
    setNewMessage('');
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Conversation avec {recipientName}</Text>
      
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ 
            alignSelf: item.sender === firebaseAuth.currentUser.uid ? 'flex-end' : 'flex-start',
            backgroundColor: item.sender === firebaseAuth.currentUser.uid ? '#DCF8C6' : '#ECECEC',
            padding: 10,
            margin: 5,
            borderRadius: 10
          }}>
            <Text>{item.text}</Text>
            <Text style={{ fontSize: 10 }}>
              {new Date(item.createdAt?.seconds * 1000).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
      
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Tapez votre message..."
        />
        <Button title="Envoyer" onPress={handleSend} />
      </View>
    </View>
  );
};

export default ChatScreen;