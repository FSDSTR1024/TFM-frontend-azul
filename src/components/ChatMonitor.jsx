import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatMonitor.css"; // Crear este archivo CSS según necesidades
const ChatMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [roomToJoin, setRoomToJoin] = useState("");
  const [messageText, setMessageText] = useState("");
  const [senderId, setSenderId] = useState("");
  const [orderId, setOrderId] = useState("");
  const socketRef = useRef(null);
  const logsEndRef = useRef(null);
  useEffect(() => {
    // Inicializar socket
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      reconnection: true,
    });
    // Eventos de conexión
    socketRef.current.on("connect", () => {
      addLog("✅ Socket conectado: " + socketRef.current.id);
      setConnected(true);
    });
    socketRef.current.on("disconnect", (reason) => {
      addLog("❌ Socket desconectado: " + reason);
      setConnected(false);
    });
    socketRef.current.on("connect_error", (error) => {
      addLog("❌ Error de conexión: " + error.message);
      setConnected(false);
    });
    // Eventos del chat
    socketRef.current.on("newMessage", (data) => {
      addLog("📨 Mensaje recibido:", data);
    });
    socketRef.current.on("joinedChatRoom", (data) => {
      addLog("🚪 Unido a sala de chat:", data);
    });
    socketRef.current.on("chatClosed", (data) => {
      addLog("🔒 Chat cerrado:", data);
    });
    socketRef.current.on("messageSent", (data) => {
      addLog("📤 Mensaje enviado confirmado:", data);
    });
    socketRef.current.on("socketError", (data) => {
      addLog("⚠️ Error de socket:", data);
    });
    // Escuchar todos los eventos (útil para debugging)
    const originalOnEvent = socketRef.current.onevent;
    socketRef.current.onevent = function (packet) {
      const eventName = packet.data[0];
      const eventData = packet.data[1];

      // Excluir eventos comunes para no saturar los logs
      if (
        ![
          "newMessage",
          "joinedChatRoom",
          "chatClosed",
          "messageSent",
          "socketError",
          "connect",
          "disconnect",
          "connect_error",
        ].includes(eventName)
      ) {
        addLog(`🔄 Evento genérico [${eventName}]:`, eventData);
      }

      originalOnEvent.call(this, packet);
    };
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  // Auto-scroll para los logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);
  const addLog = (message, data = null) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
    setLogs((prevLogs) => [
      ...prevLogs,
      {
        id: Date.now(),
        timestamp,
        message,
        data: data ? JSON.stringify(data, null, 2) : null,
      },
    ]);
  };
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomToJoin) return;
    addLog(`🔄 Intentando unirse a sala: ${roomToJoin}`);
    socketRef.current.emit("joinChatRoom", roomToJoin);
    setRoomToJoin("");
  };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText || !senderId || !orderId) return;
    addLog(`🔄 Enviando mensaje a orden: ${orderId}`);
    socketRef.current.emit("sendMessage", {
      orderId,
      senderId,
      text: messageText,
    });
    setMessageText("");
  };
  const handleClearLogs = () => {
    setLogs([]);
  };
  const handlePingServer = () => {
    addLog("🔄 Enviando ping al servidor...");
    socketRef.current.emit(
      "pingServer",
      { timestamp: Date.now() },
      (response) => {
        addLog("🔄 Respuesta del servidor (ping):", response);
      }
    );
  };
  return (
    <div className="chat-monitor">
      <h2>Monitor de Chat</h2>
      <div className="connection-status">
        Estado: {connected ? "Conectado ✅" : "Desconectado ❌"}
        <button onClick={handlePingServer} disabled={!connected}>
          Ping Servidor
        </button>
        <button onClick={handleClearLogs}>Limpiar Logs</button>
      </div>
      <div className="monitor-actions">
        <div className="action-panel">
          <h3>Unirse a Sala</h3>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              placeholder="ID de Orden"
              value={roomToJoin}
              onChange={(e) => setRoomToJoin(e.target.value)}
            />
            <button type="submit" disabled={!connected || !roomToJoin}>
              Unirse
            </button>
          </form>
        </div>
        <div className="action-panel">
          <h3>Enviar Mensaje</h3>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="ID de Orden"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <input
              type="text"
              placeholder="ID de Remitente"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Mensaje"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!connected || !messageText || !senderId || !orderId}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
      <div className="logs-container">
        <h3>Logs de Eventos</h3>
        <div className="logs">
          {logs.map((log) => (
            <div key={log.id} className="log-entry">
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-message">{log.message}</span>
              {log.data && (
                <pre className="log-data">
                  <code>{log.data}</code>
                </pre>
              )}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
export default ChatMonitor;
