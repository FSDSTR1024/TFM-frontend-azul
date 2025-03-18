import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserOrders from "./UserOrders";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import { Link } from "react-router-dom";
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
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Socket.io connection
  useEffect(() => {
    // Connect to socket server
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    if (user && user.id) {
      // Listen for changes to user's orders
      socketRef.current.on("orderUpdated", (data) => {
        if (data.userId === user.id) {
          fetchOrders(); // Refresh orders list

          // Add notification based on status
          let message = `Your order #${data.orderId.substring(
            data.orderId.length - 6
          )} status updated to ${data.status}`;

          if (data.status === "accepted") {
            message = `Your order #${data.orderId.substring(
              data.orderId.length - 6
            )} has been accepted by a driver`;
          } else if (data.status === "in-progress") {
            message = `Your order #${data.orderId.substring(
              data.orderId.length - 6
            )} is now in progress`;
          } else if (data.status === "completed") {
            message = `Your order #${data.orderId.substring(
              data.orderId.length - 6
            )} has been completed`;
          }

          addNotification({
            id: data.orderId,
            message,
            createdAt: new Date(),
            isRead: false,
            type: data.status,
          });
        }
      });

      // Listen for order cancellations
      socketRef.current.on("orderCancelled", (data) => {
        if (data.userId === user.id) {
          fetchOrders(); // Refresh orders list

          addNotification({
            id: data.orderId,
            message: `Your order #${data.orderId.substring(
              data.orderId.length - 6
            )} has been cancelled`,
            createdAt: new Date(),
            isRead: false,
            type: "cancelled",
          });
        }
      });

      // Listen for new chat messages
      socketRef.current.on("newMessage", (data) => {
        if (chatOrder && chatOrder._id === data.orderId) {
          setChatMessages((prev) => [...prev, data.message]);
        } else {
          // Add notification about new message
          addNotification({
            id: data.orderId,
            message: `New message for order #${data.orderId.substring(
              data.orderId.length - 6
            )}`,
            createdAt: new Date(),
            isRead: false,
            type: "new-message",
          });
        }
      });

      // Listen for chat closed event
      socketRef.current.on("chatClosed", (data) => {
        if (chatOrder && chatOrder._id === data.orderId) {
          addNotification({
            id: data.orderId,
            message: `Chat for order #${data.orderId.substring(
              data.orderId.length - 6
            )} has been closed`,
            createdAt: new Date(),
            isRead: false,
            type: "chat-closed",
          });

          // Close the chat if it's open
          setChatOrder(null);
          setChatMessages([]);
        }
      });
    }

    return () => {
      // Disconnect socket when component unmounts
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, chatOrder]);

  // Function to add a notification to the list
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setHasNewNotifications(true);
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
    fetchNotifications();
  }, []);

  // Mark all notifications as read when viewing notifications section
  useEffect(() => {
    if (activeSection === "notifications" && hasNewNotifications) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setHasNewNotifications(false);
    }
  }, [activeSection, hasNewNotifications]);

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
      // Join the chat room
      socketRef.current.emit("joinChatRoom", order._id);

      // Fetch chat messages
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/messages`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const data = await response.json();
      setChatMessages(data.messages || []);
      setChatOrder(order);

      // Mark related notifications as read
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === order._id && notif.type === "new-message"
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleCloseChat = () => {
    setChatOrder(null);
    setChatMessages([]);
    setMessageInput("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !chatOrder) return;

    try {
      // API call to send message
      const response = await fetch(
        `http://localhost:5000/api/chat/${chatOrder._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: messageInput }),
        }
      );

      if (response.ok) {
        // Message will be added via socket event
        setMessageInput("");
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
        // Order update will come through socket event
        addNotification({
          id: orderId,
          message: `You have cancelled order #${orderId.substring(
            orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "cancelled",
        });
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
              <button onClick={() => setActiveSection("profile")}>
                Perfil
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection("orders")}>
                Pedidos
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection("Mis Pedidos")}>
                Mis Pedidos
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection("notifications")}>
                Notificaciones
                {hasNewNotifications && (
                  <span className="notification-badge">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection("upgrade")}>
                Mejorar a Empresa
              </button>
            </li>
          </ul>
        </aside>
        <section className="content-section">
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
                            // Find order and open chat
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

      {/* Chat Modal */}
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

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <p className="no-messages">
                No hay mensajes. ¡Inicia la conversación!
              </p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${
                    msg.senderId === user.id ? "sent" : "received"
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
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default UserProfile;
