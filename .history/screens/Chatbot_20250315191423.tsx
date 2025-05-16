import axios from "axios";
import React, { useState } from "react";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");

        // Envoi de la requête à l'API backend
        try {
            const response = await axios.post("http://localhost:5000/chat", {
                message: input,
            });
            const botReply = response.data.reply;
            setMessages([
                ...messages,
                { text: botReply, sender: "bot" },
            ]);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="chatbot">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question..."
            />
            <button onClick={sendMessage}>Envoyer</button>
        </div>
    );
}

export default Chatbot;
