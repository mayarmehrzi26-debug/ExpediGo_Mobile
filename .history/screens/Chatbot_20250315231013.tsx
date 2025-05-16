import axios from "axios";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
            setMessages([...messages, { text: botReply, sender: "bot" }]);
        } catch (error) {
            setMessages([...messages, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.", sender: "bot" }]);
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
        <View style={styles.outerContainer}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: "#6A5ACD", // Couleur mauve
        padding: 10,
    },
    chatbot: {
        flex: 1,
        padding: 10,
        backgroundColor: "#EAEAF0", // Couleur de fond du chatbot
        borderRadius: 10,
    },
    messages: {
        paddingBottom: 10,
        paddingTop: 20,
    },
    user: {
        alignSelf: "flex-end",
        backgroundColor: "#d3f8d3",
        padding: 10,
        marginBottom: 5,
        borderRadius: 15,
        maxWidth: "80%",
    },
    bot: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f1f1",
        padding: 10,
        marginBottom: 5,
        borderRadius: 15,
        maxWidth: "80%",
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        marginHorizontal: 10,
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