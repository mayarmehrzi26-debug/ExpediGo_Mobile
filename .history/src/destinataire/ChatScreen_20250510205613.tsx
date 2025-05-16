import { useRoute } from '@react-navigation/native';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firebaseAuth, firebasestore } from '../../FirebaseConfig';
import Header from '../../src/components/Header';

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { conversationId, recipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firebasestore, "conversations", conversationId, "messages"),
      (querySnapshot) => {
        const msgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        // Tri du plus ancien au plus récent
        setMessages(msgs.sort((a, b) => a.createdAt - b.createdAt));
        
        // Scroll vers le bas après mise à jour
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
    <View style={styles.container}>
      <Header 
        title={`Discussion avec ${recipientName}`} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <FlatList
        ref={flatListRef}
        style={styles.messagesContainer}
        data={messages}
        keyExtractor={item => item.id}
        // Supprimé: inverted={true}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender === firebaseAuth.currentUser.uid 
              ? styles.sentMessage 
              : styles.receivedMessage
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>
              {item.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Envoyez votre premier message</Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrivez un message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Icon 
            name="send" 
            size={24} 
            color={newMessage.trim() ? "#44076a" : "#ccc"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1D5F7',
    borderTopRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    marginLeft: 8,
    padding: 10,
  },
});

export default ChatScreen;