import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import Chat2 from "../components/Chat2";
import {
  Truck,
  Package,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Edit,
  Bell,
  MessageCircle,
  Camera,
  Upload,
} from "lucide-react";
import "./DriverProfile.css";

const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Connect to Socket.io server
  useEffect(() => {
    // Initialize socket
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    // Get driver ID from auth token once it's loaded
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Listen for new orders
    socketRef.current.on("newOrder", (order) => {
      // Add to notifications
      const newNotification = {
        id: order._id,
        message: `Nueva orden disponible: ${order.pickupLocation} a ${order.dropoffLocation}`,
        createdAt: new Date(),
        isRead: false,
        type: "new-order",
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setHasNewNotifications(true);
    });

    // Listen for order status changes
    socketRef.current.on("orderUpdated", (data) => {
      // Update orders list if the updated order belongs to this driver
      fetchDriverOrders();
    });

    // Listen for new chat messages
    socketRef.current.on("newMessage", (data) => {
      // If this message is for a chat we're currently in
      if (activeChatOrder && activeChatOrder._id === data.orderId) {
        setChatMessages((prev) => [...prev, data.message]);
      } else {
        // Add notification about new message
        const newNotification = {
          id: data.orderId,
          message: `Nuevo mensaje en la Orden #${data.orderId.substring(
            data.orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "new-message",
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setHasNewNotifications(true);
      }
    });

    return () => {
      // Disconnect socket when component unmounts
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate, activeChatOrder]);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch driver profile using token
        const profileResponse = await fetch(
          "http://localhost:5000/api/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Error al cargar el perfil");
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);
        setUpdatedProfile(profileData);

        // Fetch driver orders
        await fetchDriverOrders();

        // Fetch driver notifications
        await fetchNotifications();

        setLoading(false);
      } catch (err) {
        setError("Error cargando los datos del perfil");
        setLoading(false);
        console.error(err);
      }
    };

    fetchDriverData();
  }, [navigate]);

  const fetchDriverOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      // For testing, we'll use available orders since we don't have a specific driver orders endpoint yet
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/available",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!ordersResponse.ok) {
        throw new Error("Error al cargar órdenes");
      }

      const ordersData = await ordersResponse.json();
      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al cargar notificaciones");
      }

      const notificationsData = await response.json();
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedProfile(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar perfil");
      }

      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      // API call to accept the order
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Join the chat room for this order
        socketRef.current.emit("joinChatRoom", orderId);

        // Update orders list
        fetchDriverOrders();

        // Add notification
        const newNotification = {
          id: orderId,
          message: `Has aceptado la Orden #${orderId.substring(
            orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "order-accepted",
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (err) {
      console.error("Error accepting order:", err);
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      // API call to start the delivery
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/start`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update orders list
        fetchDriverOrders();
      }
    } catch (err) {
      console.error("Error starting delivery:", err);
    }
  };

  // Nueva función para manejar la subida de imágenes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Nueva función para abrir el modal de completar orden
  const handleCompleteOrderClick = (order) => {
    setOrderToComplete(order);
    setShowCompletionModal(true);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Nueva función para cancelar la subida de imagen
  const handleCancelUpload = () => {
    setOrderToComplete(null);
    setShowCompletionModal(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Nueva función para completar la orden con prueba de entrega
  const handleCompleteOrder = async () => {
    if (!selectedImage || !orderToComplete) return;

    try {
      setUploadingImage(true);
      const token = localStorage.getItem("token");

      // Primero subimos la imagen
      const formData = new FormData();
      formData.append("image", selectedImage);

      const uploadResponse = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.imageUrl;

      // Ahora completamos la orden con la URL de la imagen
      const completeResponse = await fetch(
        `http://localhost:5000/api/orders/${orderToComplete._id}/proof`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Error al completar la orden");
      }

      const completeData = await completeResponse.json();

      if (completeData.success) {
        // Emitir evento socket
        socketRef.current.emit("completeOrder", {
          orderId: orderToComplete._id,
          driverId: profile._id,
          proofImageUrl: imageUrl,
        });

        // Actualizar lista de órdenes
        fetchDriverOrders();

        // Añadir notificación
        const newNotification = {
          id: orderToComplete._id,
          message: `Has completado la Orden #${orderToComplete._id.substring(
            orderToComplete._id.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "order-completed",
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Cerrar modal
        setShowCompletionModal(false);
        setOrderToComplete(null);
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error completing order:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenChat = async (order) => {
    try {
      const token = localStorage.getItem("token");

      // Join chat room
      socketRef.current.emit("joinChatRoom", order._id);

      // Fetch chat messages
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setChatMessages(data.messages || []);
      setActiveChatOrder(order);

      // Mark related notifications as read
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === order._id && notif.type === "new-message"
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

  const handleCloseChat = () => {
    setActiveChatOrder(null);
    setChatMessages([]);
    setMessageInput("");
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatOrder) return;

    try {
      const token = localStorage.getItem("token");

      // API call to send message
      const response = await fetch(
        `http://localhost:5000/api/chat/${activeChatOrder._id}/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: messageInput }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Message will be added to chat via socket event
        setMessageInput("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    setHasNewNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllNotificationsAsRead();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="status-badge status-pending">Pendiente</span>;
      case "accepted":
        return <span className="status-badge status-accepted">Aceptado</span>;
      case "in-progress":
        return (
          <span className="status-badge status-in-progress">En Progreso</span>
        );
      case "completed":
        return (
          <span className="status-badge status-completed">Completado</span>
        );
      case "cancelled":
        return <span className="status-badge status-cancelled">Cancelado</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="driver-profile-container">
      <Navbar />

      <div className="driver-profile-main">
        {profile && (
          <div className="profile-content">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-header-content">
                <div className="profile-avatar">
                  <User size={48} />
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{`${profile.firstName} ${profile.lastName}`}</h2>
                  <p className="profile-detail">
                    <Truck className="icon" size={16} />
                    {profile.vehicleType || "No especificado"}
                  </p>
                  <p className="profile-detail">
                    <MapPin className="icon" size={16} />
                    {profile.workCity || "No especificado"}
                  </p>
                </div>
                <div className="profile-status">
                  <div className="status-badge driver-active">
                    Conductor Activo
                  </div>
                  <div className="notification-bell">
                    <button
                      onClick={toggleNotifications}
                      className="notification-button"
                      aria-label="Notificaciones"
                    >
                      <Bell size={20} />
                      {hasNewNotifications && (
                        <span className="notification-indicator"></span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="notifications-dropdown">
                        <div className="notifications-header">
                          <h3>Notificaciones</h3>
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="mark-read-button"
                          >
                            Marcar todo como leído
                          </button>
                        </div>
                        <div className="notifications-list">
                          {notifications.length > 0 ? (
                            notifications.map((notif, idx) => (
                              <div
                                key={idx}
                                className={`notification-item ${
                                  notif.isRead ? "" : "unread"
                                }`}
                              >
                                <p className="notification-message">
                                  {notif.message}
                                </p>
                                <p className="notification-time">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                                {notif.type === "new-order" && (
                                  <button
                                    onClick={() => handleAcceptOrder(notif.id)}
                                    className="accept-button"
                                  >
                                    Aceptar
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="no-notifications">
                              No hay notificaciones
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="profile-tabs">
              <button
                onClick={() => setActiveTab("profile")}
                className={activeTab === "profile" ? "active" : ""}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={activeTab === "orders" ? "active" : ""}
              >
                Mis Órdenes
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={activeTab === "notifications" ? "active" : ""}
              >
                Notificaciones
                {hasNewNotifications && (
                  <span className="badge">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "profile" && (
                <div className="profile-details">
                  <div className="profile-section">
                    <h3>Información Personal</h3>
                    <div className="info-card">
                      <div className="info-item">
                        <Mail className="icon" size={18} />
                        <div>
                          <p className="info-label">Email</p>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={updatedProfile.email}
                              onChange={handleChange}
                              className="edit-input"
                              required
                            />
                          ) : (
                            <p className="info-value">{profile.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-item">
                        <Phone className="icon" size={18} />
                        <div>
                          <p className="info-label">Teléfono</p>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={updatedProfile.phoneNumber}
                              onChange={handleChange}
                              className="edit-input"
                              required
                            />
                          ) : (
                            <p className="info-value">{profile.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-item">
                        <Calendar className="icon" size={18} />
                        <div>
                          <p className="info-label">Fecha de Nacimiento</p>
                          {isEditing ? (
                            <input
                              type="date"
                              name="birthdate"
                              value={
                                updatedProfile.birthdate
                                  ? updatedProfile.birthdate.substring(0, 10)
                                  : ""
                              }
                              onChange={handleChange}
                              className="edit-input"
                              required
                            />
                          ) : (
                            <p className="info-value">
                              {profile.birthdate
                                ? new Date(
                                    profile.birthdate
                                  ).toLocaleDateString()
                                : "No especificado"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>Información del Conductor</h3>
                    <div className="info-card">
                      <div className="info-item">
                        <Truck className="icon" size={18} />
                        <div>
                          <p className="info-label">Tipo de Vehículo</p>
                          {isEditing ? (
                            <select
                              name="vehicleType"
                              value={updatedProfile.vehicleType}
                              onChange={handleChange}
                              className="edit-input"
                              required
                            >
                              <option value="bicicleta">Bicicleta</option>
                              <option value="moto">Moto</option>
                              <option value="coche">Coche</option>
                            </select>
                          ) : (
                            <p className="info-value">{profile.vehicleType}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-item">
                        <MapPin className="icon" size={18} />
                        <div>
                          <p className="info-label">Ciudad de Trabajo</p>
                          {isEditing ? (
                            <input
                              type="text"
                              name="workCity"
                              value={updatedProfile.workCity}
                              onChange={handleChange}
                              className="edit-input"
                              required
                            />
                          ) : (
                            <p className="info-value">{profile.workCity}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-item">
                        <Clock className="icon" size={18} />
                        <div>
                          <p className="info-label">Miembro desde</p>
                          <p className="info-value">
                            {profile.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString()
                              : "No disponible"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="button secondary"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="button primary"
                          >
                            Guardar Cambios
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditProfile}
                          className="button primary"
                        >
                          <Edit className="icon" size={16} />
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="orders-tab">
                  <div className="tab-header">
                    <h3>Tus Órdenes</h3>
                    <button
                      className="button primary"
                      onClick={() => navigate("/available-orders")}
                    >
                      Buscar Órdenes Disponibles
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <Package className="icon" size={48} />
                      <h3>No hay órdenes aún</h3>
                      <p>Comienza aceptando órdenes para verlas aquí.</p>
                    </div>
                  ) : (
                    <div className="orders-table-container">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>ID de Orden</th>
                            <th>Recogida</th>
                            <th>Entrega</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id}>
                              <td className="order-id">
                                #{order._id.substring(order._id.length - 6)}
                              </td>
                              <td>{order.pickupLocation}</td>
                              <td>{order.dropoffLocation}</td>
                              <td>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td className="order-actions">
                                {order.status === "pending" && (
                                  <button
                                    onClick={() => handleAcceptOrder(order._id)}
                                    className="button small primary"
                                  >
                                    Aceptar
                                  </button>
                                )}
                                {order.status === "accepted" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStartDelivery(order._id)
                                      }
                                      className="button small primary"
                                    >
                                      Iniciar Entrega
                                    </button>
                                    <button
                                      onClick={() => handleOpenChat(order)}
                                      className="button small secondary"
                                    >
                                      <MessageCircle size={14} />
                                      Chat
                                    </button>
                                  </>
                                )}
                                {order.status === "in-progress" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleCompleteOrderClick(order)
                                      }
                                      className="button small success"
                                    >
                                      <CheckCircle size={14} className="icon" />
                                      Completar
                                    </button>
                                    <button
                                      onClick={() => handleOpenChat(order)}
                                      className="button small secondary"
                                    >
                                      <MessageCircle size={14} />
                                      Chat
                                    </button>
                                  </>
                                )}
                                {(order.status === "completed" ||
                                  order.status === "cancelled") && (
                                  <button
                                    onClick={() =>
                                      navigate(`/orders/${order._id}`)
                                    }
                                    className="button small secondary"
                                  >
                                    Ver Detalles
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="notifications-tab">
                  <h3>Notificaciones</h3>

                  <div className="notifications-container">
                    {notifications.length === 0 ? (
                      <div className="empty-state">
                        <Bell className="icon" size={48} />
                        <h3>No hay notificaciones</h3>
                        <p>¡Estás al día!</p>
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div
                          key={index}
                          className={`notification-card ${
                            notification.isRead ? "" : "unread"
                          }`}
                        >
                          <div className="notification-content">
                            <p className="notification-message">
                              {notification.message}
                            </p>
                            <p className="notification-time">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                          {notification.type === "new-order" && (
                            <button
                              onClick={() => handleAcceptOrder(notification.id)}
                              className="button small success"
                            >
                              Aceptar
                            </button>
                          )}
                          {notification.type === "new-message" && (
                            <button
                              onClick={() => {
                                // Find the order and open chat
                                const order = orders.find(
                                  (o) => o._id === notification.id
                                );
                                if (order) handleOpenChat(order);
                              }}
                              className="button small primary"
                            >
                              <MessageCircle size={14} className="icon" />
                              Responder
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {activeChatOrder && (
          <div className="chat-modal">
            <div className="chat-header">
              <h3>
                Chat - Orden #
                {activeChatOrder._id.substring(activeChatOrder._id.length - 6)}
              </h3>
              <button className="close-button" onClick={handleCloseChat}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <p className="empty-chat">
                  No hay mensajes aún. ¡Inicia la conversación!
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${
                      msg.senderId === profile._id ? "sent" : "received"
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
            <div className="chat-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Escribe un mensaje..."
              />
              <button onClick={handleSendMessage} className="send-button">
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* Modal para completar orden con foto */}
        {showCompletionModal && (
          <div className="completion-modal-overlay">
            <div className="completion-modal">
              <div className="completion-modal-header">
                <h3>
                  Completar Orden #
                  {orderToComplete._id.substring(
                    orderToComplete._id.length - 6
                  )}
                </h3>
                <button className="close-button" onClick={handleCancelUpload}>
                  <XCircle size={20} />
                </button>
              </div>
              <div className="completion-modal-content">
                <p>
                  Sube una foto como prueba de entrega para completar la orden:
                </p>

                {imagePreview ? (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview de la entrega"
                      className="image-preview"
                    />
                    <button
                      className="change-image-button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-upload-area"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Camera size={48} className="upload-icon" />
                    <p>Haz clic para seleccionar una imagen</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                  style={{ display: "none" }}
                />

                <div className="completion-modal-actions">
                  <button
                    className="button secondary"
                    onClick={handleCancelUpload}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button primary"
                    onClick={handleCompleteOrder}
                    disabled={!selectedImage || uploadingImage}
                  >
                    {uploadingImage ? "Subiendo..." : "Completar Entrega"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DriverProfile;
