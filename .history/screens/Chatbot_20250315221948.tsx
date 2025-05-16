import axios from "axios";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assurez-vous que le chemin est correct

// Définir les types pour les messages
interface Message {
    text: string;
    sender: "user" | "bot";
}

function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        if (!input.trim()) return; // Ne pas envoyer si l'input est vide

        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");

        try {
            const response = await axios.post("http://192.168.199.160:5000/chat", {
                message: input,
            });
            const botReply = response.data.reply;
            setMessages([
                ...messages,
                { text: botReply, sender: "bot" },
            ]);
        } catch (error) {
            setMessages([
                ...messages,
                { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.", sender: "bot" },
            ]);
            console.error("Error:", error);
        }
    };

    // Gérer le changement d'input
    const handleInputChange = (text: string) => {
        setInput(text);
    };

    // Gérer l'envoi via le formulaire
    const handleFormSubmit = () => {
        sendMessage();
    };

    return (
        <View style={styles.chatbot}>
            <View style={styles.messages}>
                {messages.map((msg, index) => (
                    <View key={index} style={msg.sender === "user" ? styles.user : styles.bot}>
                        <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={handleInputChange}
                    placeholder="Posez une question..."
                />
                {input.length > 0 && ( // Affiche le bouton seulement si l'input n'est pas vide
                    <TouchableOpacity onPress={handleFormSubmit} style={styles.sendButton}>
                        <Icon name="send" size={24} color="#4A0072" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chatbot: {
        flex: 1,
        justifyContent: "flex-start",
        padding: 10,
        backgroundColor: "#f0f0f0",
    },
    
    messages: {
        flexGrow: 1,
        paddingBottom: 10,
        paddingTop:50,

    },
    user: {
        alignSelf: "flex-end",
        backgroundColor: "#d3f8d3",
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
        maxWidth: "80%",
    },
    bot: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f1f1",
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
        maxWidth: "80%",
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginRight: 10,
    },
    sendButton: {
        padding: 10,
    },
});

export default Chatbot;