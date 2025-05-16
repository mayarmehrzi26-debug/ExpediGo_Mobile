import axios from "axios";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Importer MaterialCommunityIcons

// Définir les types pour les messages
interface Message {
    text: string;
    sender: "user" | "bot";
}

function Chatbot({ navigation }) { // Assurez-vous que navigation est passé en props
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages(prevMessages => [...prevMessages, { text: input, sender: "user" }]);
        setInput("");

        try {
            const response = await axios.post("http://192.168.199.160:5000/chat", {
                message: input,
            });
            const botReply = response.data.reply;
            setMessages(prevMessages => [...prevMessages, { text: botReply, sender: "bot" }]);
        } catch (error) {
            setMessages(prevMessages => [...prevMessages, { text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.", sender: "bot" }]);
            console.error("Error:", error);
        }
    };

    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleFormSubmit = () => {
        sendMessage();
    };

    const handleBackButton = () => {
        navigation.goBack(); // Utiliser la fonction goBack pour revenir à l'écran précédent
    };

    return (
        <View style={styles.outerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackButton} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
                    <Text style={styles.backButtonText}></Text>
                </TouchableOpacity>
            </View>
            <View style={styles.botIconContainer}>
                <View style={styles.circle}>
                    <MaterialCommunityIcons name="robot" size={40} color="#4A0072" /> 
                </View>
                <Text style={styles.title}>ExpediBot</Text>
            </View>
            <View style={styles.chatbot}>
                <FlatList
                    data={messages}
                    renderItem={({ item }) => (
                        <View style={item.sender === "user" ? styles.user : styles.bot}>
                            <Text style={[styles.messageText, item.sender === "user" && styles.userText]}>{item.text}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.messages}
                    inverted
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
                            <MaterialCommunityIcons name="send" size={24} color="#ffffff" />
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
        backgroundColor: "#4A0072", 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4A0072",
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: "#ffffff",
        marginLeft: 5,
    },
    botIconContainer: {
        alignItems: "center",
        marginBottom: 50,
    },
    circle: {
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        backgroundColor: "#EAEAF0", 
        alignItems: "center",
        justifyContent: "center",
    },
    chatbot: {
        flex: 1,
        padding: 10,
        backgroundColor: "#EAEAF0",
        borderTopRightRadius: 60,
        borderTopLeftRadius: 60,
    },
    messages: {
        paddingBottom: 10,
        paddingTop: 20,
    },
    user: {
        alignSelf: "flex-end",
        backgroundColor: "#4A0072",
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
    userText: {
        color: "#ffffff", // Couleur du texte de l'utilisateur en blanc
    },
    title: {
        fontSize: 16,
        color: "#EAEAF0",
        paddingTop: 9,
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