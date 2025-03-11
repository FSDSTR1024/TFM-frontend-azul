// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./Chat2.css";

const socket = io("http://localhost:5000");
const Chat2 = () => {
  const { user } = useContext(AuthContext);
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    socket.emit("joinRoom", { orderId });
    socket.on(`chat:${orderId}`, (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off(`chat:${orderId}`);
    };
  }, [orderId]);
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const messageData = {
      orderId,
      senderId: user.id,
      receiverId: "other_user_id", // Esto debe actualizarse con la lógica correcta
      message: newMessage,
    };
    try {
      const response = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      const data = await response.json();
      if (data.success) {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };
  return (
    <div className="chat-container">
      <h2>Chat del Pedido</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.senderId === user.id ? "my-message" : "other-message"
            }
          >
            <p>
              <strong>
                {msg.senderId === user.id ? "Tú" : "Conductor/Cliente"}:
              </strong>{" "}
              {msg.message}
            </p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};
export default Chat2;
