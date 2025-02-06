import React, { useState } from "react";
import "./Chat.css";

const Chat = ({ order, closeChat }) => {
    if (!order) return null; // 🔥 Evita errores si `order` es `null`

    const [messages, setMessages] = useState([
        { sender: "DRIVER", text: "Hola, estoy en camino 🚛" },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        setMessages([...messages, { sender: "Tú", text: newMessage }]);
        setNewMessage("");

        setTimeout(() => {
            setMessages(prevMessages => [...prevMessages, { sender: "DRIVER", text: "Recibido 👍" }]);
        }, 2000);
    };

    return (
        <>
            <div className="chat-overlay" onClick={closeChat}></div>

            <div className="chat-modal">
                <button className="chat-close" onClick={closeChat}>X</button>
                <h2>Chat con DRIVER</h2>
                <p className="order-info">Pedido #{order.id} - Estado: {order.status}</p>

                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === "Tú" ? "sent" : "received"}`}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    ))}
                </div>

                <div className="chat-input">
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                    />
                    <button onClick={sendMessage}>Enviar</button>
                </div>
            </div>
        </>
    );
};

export default Chat;
