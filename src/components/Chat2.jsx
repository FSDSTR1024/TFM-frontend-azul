import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import "./Chat2.css";

const Chat2 = ({ order, onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Conectar a Socket.io con mejor manejo de errores
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Manejar estados de conexión
    socketRef.current.on("connect", () => {
      console.log("Chat socket conectado exitosamente!");
      setSocketConnected(true);

      // Unirse a la sala de chat cuando se conecta
      if (order && order._id) {
        console.log("Uniéndose a la sala de chat:", order._id);
        socketRef.current.emit("joinChatRoom", order._id);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Error de conexión del socket:", error);
      setSocketConnected(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket desconectado:", reason);
      setSocketConnected(false);
    });

    // Unirse a la sala de chat para esta orden
    if (order && order._id) {
      // Escuchar nuevos mensajes con mejor manejo de errores
      socketRef.current.on("newMessage", (data) => {
        console.log("Nuevo mensaje recibido:", data);
        if (data.orderId === order._id && data.message) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      });

      // Escuchar evento de cierre de chat
      socketRef.current.on("chatClosed", (data) => {
        console.log("Evento chatClosed recibido:", data);
        if (data.orderId === order._id) {
          setError("Chat cerrado: " + data.message);
          if (onClose) {
            setTimeout(() => onClose(), 3000); // Cerrar después de 3 segundos
          }
        }
      });

      // Cargar historial de mensajes
      const fetchMessages = async () => {
        try {
          setLoading(true);
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
            throw new Error(`Error al cargar los mensajes: ${response.status}`);
          }

          const data = await response.json();
          console.log("Mensajes obtenidos:", data);

          if (data.success) {
            setMessages(data.messages || []);
          } else {
            // Si no tenemos la propiedad success, podría ser que la respuesta sea directamente un array
            setMessages(Array.isArray(data) ? data : data.messages || []);
          }
        } catch (err) {
          console.error("Error fetchMessages:", err);
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
        console.log("Desconectando socket del chat");
        socketRef.current.off("newMessage");
        socketRef.current.off("chatClosed");
        socketRef.current.disconnect();
      }
    };
  }, [order, onClose]);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !order || !order._id) return;

    try {
      // Optimistically add the message to improve UX
      const tempMessage = {
        senderId: user.id,
        text: newMessage,
        timestamp: new Date().toISOString(),
        _id: Date.now().toString(), // ID temporal
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);

      // Guardar el mensaje para enviarlo y limpiar el input
      const messageToSend = newMessage;
      setNewMessage("");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: messageToSend }),
        }
      );

      if (!response.ok) {
        console.error("Error sending message status:", response.status);
        throw new Error("Error al enviar mensaje");
      }

      // El mensaje se añadirá/actualizará a través del evento de socket
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
        {onClose && (
          <button className="close-chat-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {!socketConnected && (
        <div className="connection-warning">
          Problemas de conexión. Reconectando...
        </div>
      )}

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
              key={msg._id || index}
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
          disabled={loading || !socketConnected}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim() || !socketConnected}
        >
          {socketConnected ? "Enviar" : "Conectando..."}
        </button>
      </form>
    </div>
  );
};

export default Chat2;
