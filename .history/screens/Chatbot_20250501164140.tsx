import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface Message {
  text: string;
  sender: "user" | "bot";
}

// Configuration de l'URL de base
const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:5000",       // Pour émulateur Android
  ios: "http://localhost:5000",           // Pour émulateur iOS
  default: "http://192.168.196.160:5000"  // Pour appareil physique
});

function Chatbot({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Message de bienvenue initial
  useEffect(() => {
    setMessages([
      {
        text: "Bonjour ! Je suis ExpediBot. Comment puis-je vous aider ?",
        sender: "bot",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: "user" as const };
    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          message: input,
        },
        {
          timeout: 10000, // 10 secondes timeout
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const botReply = {
        text: response.data.reply || "Je n'ai pas compris votre demande.",
        sender: "bot" as const,
      };
      setMessages((prev) => [botReply, ...prev]);
    } catch (error) {
      console.error("API Error:", error);
      
      const errorMessage = {
        text: axios.isAxiosError(error)
          ? "Problème de connexion au serveur. Vérifiez votre internet."
          : "Une erreur inattendue est survenue.",
        sender: "bot" as const,
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackButton} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.botIconContainer}>
        <View style={styles.circle}>
          <MaterialCommunityIcons name="robot" size={40} color="#4A0072" />
        </View>
        <Text style={styles.title}>ExpediBot</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
      >
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === "user"
                  ? styles.userBubble
                  : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.sender === "user"
                    ? styles.userText
                    : styles.botText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Posez une question..."
            placeholderTextColor="#aaa"
            editable={!isLoading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (isLoading || !input.trim()) && styles.disabledButton,
            ]}
            disabled={isLoading || !input.trim()}
          >
            <MaterialCommunityIcons
              name={isLoading ? "clock-outline" : "send"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#877DAB",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  botIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EAEAF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#EAEAF0",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingTop: 20,
  },
  messagesContainer: {
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4A0072",
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#333333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
    paddingTop: 10,
    backgroundColor: "#EAEAF0",
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4A0072",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#AAAAAA",
  },
});

export default Chatbot;