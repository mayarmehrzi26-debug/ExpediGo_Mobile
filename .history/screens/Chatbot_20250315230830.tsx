import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ChatScreen = () => {
    const messages = [
        { id: '1', text: 'How can I help you today?', sender: 'bot' },
        { id: '2', text: 'I want to know more about your services.', sender: 'user' },
    ];

    const renderMessage = ({ item }) => (
        <View style={item.sender === 'bot' ? styles.botMessage : styles.userMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Bot</Text>
            </View>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContainer}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#6A5ACD',
        padding: 16,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 20,
        textAlign: 'center',
    },
    messageList: {
        flex: 1,
    },
    messageListContainer: {
        padding: 16,
    },
    botMessage: {
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    userMessage: {
        backgroundColor: '#6A5ACD',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        alignSelf: 'flex-end',
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 15,
        padding: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#6A5ACD',
        borderRadius: 15,
        padding: 10,
    },
    sendButtonText: {
        color: '#FFFFFF',
    },
});

export default ChatScreen;