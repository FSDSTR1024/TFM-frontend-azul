import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import "./Chat2.css";
const Chat2 = ({ order, closeChat }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    // Conectar a Socket.io
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });
    // Unirse a la sala de chat para esta orden
    if (order && order._id) {
      socketRef.current.emit("joinChatRoom", order._id);
      // Escuchar nuevos mensajes
      socketRef.current.on("newMessage", (data) => {
        if (data.orderId === order._id) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      });
      // Escuchar evento de cierre de chat
      socketRef.current.on("chatClosed", (data) => {
        if (data.orderId === order._id) {
          alert("El chat ha sido cerrado: " + data.message);
          if (closeChat) closeChat();
        }
      });
      // Cargar historial de mensajes
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5000/api/chat/${order._id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Error al cargar los mensajes");
          }
          const data = await response.json();
          if (data.success) {
            setMessages(data.messages || []);
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
          setError("No se pudieron cargar los mensajes. Inténtalo de nuevo.");
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
    // Limpieza al desmontar el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [order]);
  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !order || !order._id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newMessage }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }
      // El mensaje se añadirá a través del evento de socket
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    }
  };
  if (!order) {
    return (
      <div className="chat-error">
        No se ha seleccionado ninguna orden para el chat.
      </div>
    );
  }
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat - Orden #{order._id.substring(order._id.length - 6)}</h3>
        {closeChat && (
          <button className="close-chat-button" onClick={closeChat}>
            ×
          </button>
        )}
      </div>
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Cargando mensajes...</div>
        ) : error ? (
          <div className="chat-error">{error}</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            No hay mensajes aún. ¡Inicia la conversación!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.senderId === user.id ? "sent" : "received"
              }`}
            >
              <div className="message-content">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newMessage.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};
export default Chat2;
