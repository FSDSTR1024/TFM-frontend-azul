import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserOrders from "./UserOrders";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import Chat2 from "../components/Chat2";
import { io } from "socket.io-client";
import "./UserProfile.css";

function UserProfile() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [filters, setFilters] = useState({
    vehicle: "",
    city: "",
    status: "",
  });
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const navigate = useNavigate();

  // Función para agregar una notificación
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setHasNewNotifications(true);
  };

  // Función para obtener órdenes del usuario
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("User orders fetched:", data);
        setOrders(data);
      } else {
        console.error("Error fetching orders:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Función para obtener notificaciones del usuario
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error("Error fetching notifications:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Inicialización de Socket.io y listeners de eventos
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully!");
      setSocketConnected(true);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    if (user && user.id) {
      // Evento genérico orderUpdated
      socketRef.current.on("orderUpdated", (data) => {
        console.log("Order updated event received:", data);
        fetchOrders(); // Refresca las órdenes

        let message = `Tu orden #${data.orderId.substring(
          data.orderId.length - 6
        )} ha sido actualizada a ${data.status}`;

        if (data.status === "accepted") {
          message = `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} ha sido aceptada por un conductor`;
        } else if (data.status === "in-progress") {
          message = `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} está en camino`;
        } else if (data.status === "completed") {
          message = `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} ha sido completada`;
        }

        addNotification({
          id: data.orderId,
          message,
          createdAt: new Date(),
          isRead: false,
          type: data.status,
        });
      });

      // Evento específico orderAccepted
      socketRef.current.on("orderAccepted", (data) => {
        console.log("Order accepted event received:", data);
        fetchOrders();
        addNotification({
          id: data.orderId,
          message: `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} ha sido aceptada por un conductor`,
          createdAt: new Date(),
          isRead: false,
          type: "accepted",
        });
      });

      // Evento específico orderStarted
      socketRef.current.on("orderStarted", (data) => {
        console.log("Order started event received:", data);
        fetchOrders();
        addNotification({
          id: data.orderId,
          message: `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} está en camino`,
          createdAt: new Date(),
          isRead: false,
          type: "in-progress",
        });
      });

      // Evento específico orderCompleted
      socketRef.current.on("orderCompleted", (data) => {
        console.log("Order completed event received:", data);
        fetchOrders();
        addNotification({
          id: data.orderId,
          message: `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} ha sido completada`,
          createdAt: new Date(),
          isRead: false,
          type: "completed",
        });
      });

      // Evento específico orderCancelled
      socketRef.current.on("orderCancelled", (data) => {
        console.log("Order cancelled event received:", data);
        fetchOrders();
        addNotification({
          id: data.orderId,
          message: `Tu orden #${data.orderId.substring(
            data.orderId.length - 6
          )} ha sido cancelada`,
          createdAt: new Date(),
          isRead: false,
          type: "cancelled",
        });
      });

      // Evento para mensajes de chat
      socketRef.current.on("newMessage", (data) => {
        console.log("New message event received:", data);
        if (chatOrder && chatOrder._id === data.orderId) {
          setChatMessages((prev) => [...prev, data.message]);
          setTimeout(() => {
            if (chatMessagesRef.current) {
              chatMessagesRef.current.scrollTop =
                chatMessagesRef.current.scrollHeight;
            }
          }, 100);
        } else {
          addNotification({
            id: data.orderId,
            message: `Nuevo mensaje para la orden #${data.orderId.substring(
              data.orderId.length - 6
            )}`,
            createdAt: new Date(),
            isRead: false,
            type: "new-message",
          });
        }
      });

      // Evento para cierre de chat
      socketRef.current.on("chatClosed", (data) => {
        console.log("Chat closed event received:", data);
        if (chatOrder && chatOrder._id === data.orderId) {
          addNotification({
            id: data.orderId,
            message: `El chat para la orden #${data.orderId.substring(
              data.orderId.length - 6
            )} ha sido cerrado`,
            createdAt: new Date(),
            isRead: false,
            type: "chat-closed",
          });
          setChatOrder(null);
          setChatMessages([]);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("orderUpdated");
        socketRef.current.off("orderAccepted");
        socketRef.current.off("orderStarted");
        socketRef.current.off("orderCompleted");
        socketRef.current.off("orderCancelled");
        socketRef.current.off("newMessage");
        socketRef.current.off("chatClosed");
        socketRef.current.disconnect();
      }
    };
  }, [user, chatOrder]);

  // Auto-scroll en el chat cuando cambian los mensajes
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
    fetchNotifications();
  }, []);

  // Marcar notificaciones como leídas al ver la sección
  useEffect(() => {
    if (activeSection === "notifications" && hasNewNotifications) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setHasNewNotifications(false);

      // Llamada API corregida para marcar notificaciones como leídas
      try {
        fetch("http://localhost:5000/api/notifications/read", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            notificationIds: notifications
              .filter((n) => !n.isRead && n._id)
              .map((n) => n._id),
          }),
        });
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  }, [activeSection, hasNewNotifications, notifications]);

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  const filteredOrders = orders.filter((order) => {
    return (
      (filters.vehicle === "" || order.vehicleType === filters.vehicle) &&
      (filters.city === "" || order.city === filters.city) &&
      (filters.status === "" || order.status === filters.status)
    );
  });

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      companyName: formData.get("companyName"),
      cif: formData.get("cif"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
    };
    try {
      const response = await fetch("http://localhost:5000/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setUpgradeMessage(result.message);
    } catch (error) {
      console.error("Error submitting upgrade request:", error);
      setUpgradeMessage(
        "Hubo un error al enviar la solicitud. Inténtalo de nuevo."
      );
    }
  };

  const handleOpenChat = async (order) => {
    try {
      console.log("Opening chat for order:", order._id);
      if (socketRef.current) {
        socketRef.current.off("newMessage");
      }
      socketRef.current.emit("joinChatRoom", order._id);
      socketRef.current.on("newMessage", (data) => {
        console.log("New message received in UserProfile:", data);
        if (data && data.orderId === order._id && data.message) {
          setChatMessages((prevMessages) => {
            if (
              data.message._id &&
              prevMessages.some((msg) => msg._id === data.message._id)
            ) {
              return prevMessages;
            }
            return [...prevMessages, data.message];
          });
          setTimeout(() => {
            if (chatMessagesRef.current) {
              chatMessagesRef.current.scrollTop =
                chatMessagesRef.current.scrollHeight;
            }
          }, 100);
        } else if (data && data.orderId) {
          addNotification({
            id: data.orderId,
            message: `Nuevo mensaje para la orden #${data.orderId.substring(
              data.orderId.length - 6
            )}`,
            createdAt: new Date(),
            isRead: false,
            type: "new-message",
          });
        }
      });
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/messages`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Chat messages fetched:", data.messages);
        setChatOrder(order);
        setChatMessages(data.messages || []);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === order._id && notif.type === "new-message"
              ? { ...notif, isRead: true }
              : notif
          )
        );
        try {
          await fetch("http://localhost:5000/api/notifications/read", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              notificationIds: notifications
                .filter(
                  (n) => n.id === order._id && n.type === "new-message" && n._id
                )
                .map((n) => n._id),
            }),
          });
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      } else {
        console.error("Error fetching chat messages:", await response.text());
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleCloseChat = () => {
    console.log("Closing chat");
    if (socketRef.current) {
      socketRef.current.off("newMessage");
    }
    setChatOrder(null);
    setChatMessages([]);
    setMessageInput("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatOrder) return;
    try {
      const tempMessage = {
        text: messageInput,
        senderId: user.id,
        timestamp: new Date().toISOString(),
        _id: `temp-${Date.now()}`,
      };
      setChatMessages((prev) => [...prev, tempMessage]);
      const messageToSend = messageInput;
      setMessageInput("");
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop =
            chatMessagesRef.current.scrollHeight;
        }
      }, 100);
      const response = await fetch(
        `http://localhost:5000/api/chat/${chatOrder._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: messageToSend }),
        }
      );
      if (!response.ok) {
        console.error("Error sending message:", await response.text());
        setMessageInput(messageToSend);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        addNotification({
          id: orderId,
          message: `You have cancelled order #${orderId.substring(
            orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "cancelled",
        });
      } else {
        console.error("Error cancelling order:", await response.text());
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  return (
    <div className="user-profile-container">
      <Navbar />
      <div className="main-content">
        <aside className="sidebar">
          <ul>
            <li>
              <button
                onClick={() => setActiveSection("profile")}
                className={activeSection === "profile" ? "active" : ""}
              >
                Perfil
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("orders")}
                className={activeSection === "orders" ? "active" : ""}
              >
                Pedidos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("notifications")}
                className={activeSection === "notifications" ? "active" : ""}
              >
                Notificaciones
                {hasNewNotifications && (
                  <span className="notification-badge">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("upgrade")}
                className={activeSection === "upgrade" ? "active" : ""}
              >
                Mejorar a Empresa
              </button>
            </li>
          </ul>
        </aside>
        <section className="content-section">
          {!socketConnected && (
            <div className="socket-warning">
              <p>
                ⚠️ Problemas de conexión. Algunas funciones pueden no estar
                disponibles.
              </p>
            </div>
          )}
          {activeSection === "profile" && (
            <div className="profile-info">
              <h2>Información de Usuario</h2>
              <img
                src={user.profileImage || "default-avatar.png"}
                alt="Perfil"
                className="profile-avatar"
              />
              <p>
                <strong>Nombre:</strong> {user.firstName}
              </p>
              <p>
                <strong>Apellido:</strong> {user.lastName}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {user.phoneNumber}
              </p>
              <p>
                <strong>Dirección:</strong> {user.address}
              </p>
              <button className="edit-profile-button">Modificar Datos</button>
            </div>
          )}
          {activeSection === "orders" && (
            <div className="orders-list">
              <h2>Órdenes</h2>
              <Link to="/OrderForm" className="new-order-button">
                Hacer Nueva Orden
              </Link>
              {orders.length > 0 ? (
                <>
                  <div className="filters">
                    <select
                      onChange={(e) =>
                        setFilters({ ...filters, vehicle: e.target.value })
                      }
                      value={filters.vehicle}
                    >
                      <option value="">Todos los vehículos</option>
                      <option value="bicicleta">Bicicleta</option>
                      <option value="moto">Moto</option>
                      <option value="coche">Coche</option>
                    </select>
                    <select
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      value={filters.status}
                    >
                      <option value="">Todos los estados</option>
                      <option value="pending">Pendiente</option>
                      <option value="accepted">Aceptado</option>
                      <option value="in-progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  {filteredOrders.length > 0 ? (
                    <div className="orders-grid">
                      {filteredOrders.map((order) => (
                        <div key={order._id} className="order-item">
                          <div className="order-header">
                            <h3>
                              Pedido #
                              {order._id.substring(order._id.length - 6)}
                            </h3>
                            <span
                              className={`order-status status-${order.status}`}
                            >
                              {order.status === "pending" && "Pendiente"}
                              {order.status === "accepted" && "Aceptado"}
                              {order.status === "in-progress" && "En progreso"}
                              {order.status === "completed" && "Completado"}
                              {order.status === "cancelled" && "Cancelado"}
                            </span>
                          </div>
                          <div className="order-details">
                            <p>
                              <strong>Recogida:</strong> {order.pickupLocation}
                            </p>
                            <p>
                              <strong>Entrega:</strong> {order.dropoffLocation}
                            </p>
                            <p>
                              <strong>Vehículo:</strong> {order.vehicleType}
                            </p>
                            <p>
                              <strong>Fecha:</strong>{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Precio:</strong> €{order.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="order-actions">
                            {order.status === "pending" && (
                              <button
                                className="cancel-button"
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                Cancelar
                              </button>
                            )}
                            {(order.status === "accepted" ||
                              order.status === "in-progress") && (
                              <button
                                className="chat-button"
                                onClick={() => handleOpenChat(order)}
                              >
                                Chat con Driver
                              </button>
                            )}
                            {order.status === "completed" &&
                              order.proofOfDelivery && (
                                <button
                                  className="view-proof-button"
                                  onClick={() =>
                                    window.open(order.proofOfDelivery, "_blank")
                                  }
                                >
                                  Ver prueba de entrega
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-orders">
                      No hay órdenes que coincidan con los filtros.
                    </p>
                  )}
                </>
              ) : (
                <p>No tienes pedidos todavía.</p>
              )}
            </div>
          )}
          {activeSection === "Mis Pedidos" && (
            <div className="Mis Pedidos">
              <h2>Mis Pedidos</h2>
              <UserOrders />
            </div>
          )}
          {activeSection === "notifications" && (
            <div className="notifications">
              <h2>Notificaciones</h2>
              {notifications.length > 0 ? (
                <div className="notifications-list">
                  {notifications.map((notif, index) => (
                    <div
                      key={index}
                      className={`notification-item ${
                        notif.isRead ? "" : "unread"
                      }`}
                    >
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {notif.type === "new-message" && (
                        <button
                          className="reply-button"
                          onClick={() => {
                            const order = orders.find(
                              (o) => o._id === notif.id
                            );
                            if (order) handleOpenChat(order);
                          }}
                        >
                          Responder
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes notificaciones.</p>
              )}
            </div>
          )}
          {activeSection === "upgrade" && (
            <div className="upgrade-form">
              <h2>Mejorar a Empresa</h2>
              <form onSubmit={handleUpgradeSubmit}>
                <label>Nombre de la Empresa</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Ej: Mi Empresa S.L."
                  required
                />
                <label>CIF</label>
                <input
                  type="text"
                  name="cif"
                  placeholder="Ej: B12345678"
                  required
                />
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Ej: +34 987 654 321"
                  required
                />
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="empresa@example.com"
                  required
                />
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección fiscal"
                  required
                />
                <button type="submit">Enviar Solicitud</button>
              </form>
              {upgradeMessage && (
                <p className="upgrade-message">{upgradeMessage}</p>
              )}
            </div>
          )}
        </section>
      </div>

      {chatOrder && (
        <div className="chat-modal">
          <div className="chat-header">
            <h3>
              Chat - Pedido #{chatOrder._id.substring(chatOrder._id.length - 6)}
            </h3>
            <button className="close-button" onClick={handleCloseChat}>
              ×
            </button>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.length === 0 ? (
              <p className="no-messages">
                No hay mensajes. ¡Inicia la conversación!
              </p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${
                    msg.senderId === user._id ? "sent" : "received"
                  }`}
                >
                  <div className="message-bubble">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              required
            />
            <button type="submit" disabled={!socketConnected}>
              {socketConnected ? "Enviar" : "Conectando..."}
            </button>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default UserProfile;
