import axios from "axios";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assurez-vous que le chemin est correct

interface Message {
    text: string;
    sender: "user" | "bot";
}

function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");

        try {
            const response = await axios.post("http://192.168.199.160:5000/chat", {
                message: input,
            });
            const botReply = response.data.reply;
            setMessages([...messages, { text: botReply, sender: "bot" }]);
        } catch (error) {
            setMessages([...messages, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.", sender: "bot" }]);
            console.error("Error:", error);
        }
    };

    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleFormSubmit = () => {
        sendMessage();
    };

    return (
        <View style={styles.chatbot}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View style={item.sender === "user" ? styles.user : styles.bot}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messages}
                inverted // Pour que le dernier message soit en bas
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={handleInputChange}
                    placeholder="Posez une question..."
                    placeholderTextColor="#aaa"
                />
                {input.length > 0 && (
                    <TouchableOpacity onPress={handleFormSubmit} style={styles.sendButton}>
                        <Icon name="send" size={24} color="#ffffff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chatbot: {
        flex: 1,
        padding: 10,
        backgroundColor: "#EAEAF0",
    },
    messages: {
        paddingBottom: 10,
        paddingTop: 20,
    },
    user: {
        alignSelf: "flex-end",
        backgroundColor: "#6A5ACD",
        padding: 10,
        marginBottom: 5,
        borderRadius: 15,
        maxWidth: "80%",
        elevation: 3,
    },
    bot: {
        alignSelf: "flex-start",
        backgroundColor: "#FFFFFF",
        padding: 10,
        marginBottom: 5,
        borderRadius: 15,
        maxWidth: "80%",
        elevation: 3,
    },
    messageText: {
        fontSize: 16,
        color: "#000",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        padding: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 20,
        marginHorizontal: 10,
        maxHeight: "100%",
    },
    sendButton: {
        backgroundColor: "#4A0072",
        borderRadius: 20,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Chatbot;