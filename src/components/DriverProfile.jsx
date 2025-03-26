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
  const [activeTab, setActiveTab] = useState("orders"); // Cambiado a "orders" para mostrar órdenes primero
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
  const [completedOrders, setCompletedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const navigate = useNavigate();

  // Conectar al socket
  useEffect(() => {
    // Inicializar socket
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    // Obtener ID del conductor del token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Escuchar nuevas órdenes
    socketRef.current.on("newOrder", (order) => {
      // Añadir a órdenes disponibles solo si coincide con el tipo de vehículo del conductor
      if (profile && profile.vehicleType === order.vehicleType) {
        setAvailableOrders((prev) => [order, ...prev]);

        // Añadir notificación
        const newNotification = {
          id: order._id,
          message: `Nueva orden disponible: ${order.pickupLocation} a ${order.dropoffLocation}`,
          createdAt: new Date(),
          isRead: false,
          type: "new-order",
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setHasNewNotifications(true);
      }
    });

    // Escuchar cambios de estado de órdenes
    socketRef.current.on("orderUpdated", (data) => {
      // Actualizar listas de órdenes
      fetchDriverOrders();
      fetchAvailableOrders();
    });

    // Escuchar nuevos mensajes de chat
    socketRef.current.on("newMessage", (data) => {
      // Si este mensaje es para un chat que estamos viendo actualmente
      if (activeChatOrder && activeChatOrder._id === data.orderId) {
        setChatMessages((prev) => [...prev, data.message]);

        // Desplazar al final del chat
        setTimeout(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop =
              chatMessagesRef.current.scrollHeight;
          }
        }, 100);
      } else {
        // Añadir notificación sobre nuevo mensaje
        const newNotification = {
          id: data.orderId,
          message: `Nuevo mensaje en la Orden #${data.orderId.substring(
            data.orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "new-message",
          orderId: data.orderId,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setHasNewNotifications(true);
      }
    });

    return () => {
      // Desconectar socket cuando se desmonta el componente
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate, activeChatOrder, profile]);

  // Desplazar al final del chat cuando cambian los mensajes
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Obtener perfil del conductor
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

        // Obtener órdenes del conductor
        await fetchDriverOrders();

        // Obtener órdenes disponibles
        await fetchAvailableOrders();

        // Obtener notificaciones
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

      // Obtener órdenes activas del conductor
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/driver",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!ordersResponse.ok) {
        throw new Error("Error al cargar órdenes");
      }

      const ordersData = await ordersResponse.json();

      // Separar órdenes completadas de las activas
      const activeOrders = ordersData.filter(
        (order) => order.status !== "completed" && order.status !== "cancelled"
      );

      const completed = ordersData.filter(
        (order) => order.status === "completed" || order.status === "cancelled"
      );

      setOrders(activeOrders);
      setCompletedOrders(completed);
    } catch (err) {
      console.error("Error obteniendo órdenes:", err);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      // Obtener órdenes disponibles
      const availableResponse = await fetch(
        "http://localhost:5000/api/orders/available",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!availableResponse.ok) {
        throw new Error("Error al cargar órdenes disponibles");
      }

      const availableData = await availableResponse.json();
      setAvailableOrders(availableData);
    } catch (err) {
      console.error("Error obteniendo órdenes disponibles:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      // Esta función en el futuro debería obtener las notificaciones del perfil del conductor
      // Por ahora, solo verificamos si hay notificaciones no leídas
      setHasNewNotifications(notifications.some((n) => !n.isRead));
    } catch (err) {
      console.error("Error obteniendo notificaciones:", err);
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

      // Petición API para aceptar la orden
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
        // Unirse a la sala de chat para esta orden
        socketRef.current.emit("joinChatRoom", orderId);

        // Actualizar listas de órdenes
        fetchDriverOrders();
        fetchAvailableOrders();

        // Eliminar esta orden de las disponibles
        setAvailableOrders((prev) =>
          prev.filter((order) => order._id !== orderId)
        );

        // Añadir notificación
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
        setHasNewNotifications(true);
      }
    } catch (err) {
      console.error("Error aceptando orden:", err);
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      // Petición API para iniciar la entrega
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
        // Actualizar listas de órdenes
        fetchDriverOrders();

        // Añadir notificación
        const newNotification = {
          id: orderId,
          message: `Has iniciado la entrega de la Orden #${orderId.substring(
            orderId.length - 6
          )}`,
          createdAt: new Date(),
          isRead: false,
          type: "order-started",
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setHasNewNotifications(true);
      }
    } catch (err) {
      console.error("Error iniciando entrega:", err);
    }
  };

  // Función para manejar la subida de imágenes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Función para abrir el modal de completar orden
  const handleCompleteOrderClick = (order) => {
    setOrderToComplete(order);
    setShowCompletionModal(true);
    setSelectedImage(null);
    setImagePreview(null);
    setMessage("");
  };

  // Función para cancelar la subida de imagen
  const handleCancelUpload = () => {
    setOrderToComplete(null);
    setShowCompletionModal(false);
    setSelectedImage(null);
    setImagePreview(null);
    setMessage("");
  };

  // Función para completar la orden con prueba de entrega
  const handleCompleteOrder = async () => {
    if (!selectedImage || !orderToComplete) {
      setMessage("Debes seleccionar una imagen como prueba de entrega");
      return;
    }

    try {
      setUploadingImage(true);
      setMessage("Subiendo imagen...");

      // Primero preparamos los datos de la imagen
      const formData = new FormData();
      formData.append("image", selectedImage);

      // Hacer la petición de subida
      const uploadResponse = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      // Verificar si hubo error en la subida
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Error al subir la imagen");
      }

      const uploadData = await uploadResponse.json();

      // Verificar que tenemos una URL de imagen
      if (!uploadData.success || !uploadData.imageUrl) {
        throw new Error("No se pudo obtener la URL de la imagen");
      }

      setMessage("Imagen subida. Completando orden...");
      const imageUrl = uploadData.imageUrl;

      // Ahora completamos la orden con la URL de la imagen
      const completeResponse = await fetch(
        `http://localhost:5000/api/orders/${orderToComplete._id}/proof`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      // Verificar si hubo error al completar la orden
      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.message || "Error al completar la orden");
      }

      const completeData = await completeResponse.json();

      if (completeData.success) {
        // Emitir evento socket
        socketRef.current.emit("completeOrder", {
          orderId: orderToComplete._id,
          driverId: profile._id,
          proofImageUrl: imageUrl,
        });

        // Actualizar listas de órdenes
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
        setHasNewNotifications(true);

        // Mensaje de éxito
        setMessage("¡Orden completada con éxito!");

        // Cerrar modal después de un breve retraso para mostrar el mensaje
        setTimeout(() => {
          setShowCompletionModal(false);
          setOrderToComplete(null);
          setSelectedImage(null);
          setImagePreview(null);
          setMessage("");
        }, 1500);
      } else {
        throw new Error(
          completeData.message || "Error desconocido al completar la orden"
        );
      }
    } catch (err) {
      console.error("Error completando orden:", err);
      setMessage(`Error: ${err.message || "Error desconocido"}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenChat = async (order) => {
    try {
      const token = localStorage.getItem("token");

      // Unirse a sala de chat
      socketRef.current.emit("joinChatRoom", order._id);

      // Obtener mensajes del chat
      const response = await fetch(
        `http://localhost:5000/api/chat/${order._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Error obteniendo mensajes");
      }

      const data = await response.json();
      setChatMessages(data.messages || []);
      setActiveChatOrder(order);

      // Marcar notificaciones relacionadas como leídas
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === order._id && notif.type === "new-message"
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error("Error abriendo chat:", err);
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

      // Añadir mensaje inmediatamente a la interfaz para mejor UX
      const tempMessage = {
        senderId: profile._id,
        text: messageInput,
        timestamp: new Date().toISOString(),
        _id: Date.now().toString(), // ID temporal para renderizado
      };

      setChatMessages((prev) => [...prev, tempMessage]);

      // Limpiar input
      const messageToSend = messageInput;
      setMessageInput("");

      // Enviar mensaje al servidor
      const response = await fetch(
        `http://localhost:5000/api/chat/${activeChatOrder._id}/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: messageToSend }),
        }
      );

      if (!response.ok) {
        throw new Error("Error enviando mensaje");
      }

      // El mensaje real se añadirá a través del evento de socket
    } catch (err) {
      console.error("Error enviando mensaje:", err);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptada";
      case "in-progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "accepted":
        return "status-accepted";
      case "in-progress":
        return "status-progress";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
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
            {/* Cabecera del perfil */}
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

                    {/* Dropdown de Notificaciones */}
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
                                {notif.type === "new-message" && (
                                  <button
                                    onClick={() => {
                                      // Buscar la orden y abrir chat
                                      const order = [
                                        ...orders,
                                        ...completedOrders,
                                      ].find(
                                        (o) =>
                                          o._id === notif.id ||
                                          o._id === notif.orderId
                                      );
                                      if (order) handleOpenChat(order);
                                    }}
                                    className="accept-button"
                                  >
                                    Responder
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

            {/* Tabs de navegación */}
            <div className="profile-tabs">
              <button
                onClick={() => setActiveTab("orders")}
                className={activeTab === "orders" ? "active" : ""}
              >
                Mis Órdenes
              </button>
              <button
                onClick={() => setActiveTab("available")}
                className={activeTab === "available" ? "active" : ""}
              >
                Órdenes Disponibles
                {availableOrders.length > 0 && (
                  <span className="badge">{availableOrders.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={activeTab === "completed" ? "active" : ""}
              >
                Historial
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={activeTab === "profile" ? "active" : ""}
              >
                Mi Perfil
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

            {/* Contenido de los tabs */}
            <div className="tab-content">
              {/* Tab de perfil */}
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

              {/* Tab de órdenes activas */}
              {activeTab === "orders" && (
                <div className="orders-list">
                  <h2>Mis Órdenes Activas</h2>

                  {orders.length === 0 ? (
                    <div className="no-orders">
                      <p>No tienes órdenes activas.</p>
                      <p>
                        Consulta las órdenes disponibles para empezar a
                        entregar.
                      </p>
                    </div>
                  ) : (
                    <div className="orders-grid">
                      {orders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-header">
                            <div className="order-id">
                              Pedido #{order._id.substring(0, 8)}...
                            </div>
                            <div
                              className={`order-status ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          <div className="order-details">
                            <div className="order-locations">
                              <div className="pickup">
                                <strong>Recogida:</strong>{" "}
                                {order.pickupLocation}
                              </div>
                              <div className="dropoff">
                                <strong>Entrega:</strong>{" "}
                                {order.dropoffLocation}
                              </div>
                            </div>

                            <div className="order-info-row">
                              <div className="order-info-item">
                                <strong>Fecha de Creación:</strong>
                                <div>{formatDate(order.createdAt)}</div>
                              </div>
                              <div className="order-info-item">
                                <strong>Precio:</strong>
                                <div className="price">
                                  {order.price.toFixed(2)}€
                                </div>
                              </div>
                            </div>

                            <div className="order-info-row">
                              <div className="order-info-item">
                                <strong>Vehículo:</strong>
                                <div>
                                  {order.vehicleType.charAt(0).toUpperCase() +
                                    order.vehicleType.slice(1)}
                                </div>
                              </div>
                              <div className="order-info-item">
                                <strong>Tamaño del Paquete:</strong>
                                <div>
                                  {order.packageSize.charAt(0).toUpperCase() +
                                    order.packageSize.slice(1)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="order-actions">
                            {order.status === "accepted" && (
                              <>
                                <button
                                  className="chat-button"
                                  onClick={() => handleOpenChat(order)}
                                >
                                  <MessageCircle size={16} className="icon" />
                                  Chat con Cliente
                                </button>
                                <button
                                  className="start-button"
                                  onClick={() => handleStartDelivery(order._id)}
                                >
                                  <Truck size={16} className="icon" />
                                  Iniciar Entrega
                                </button>
                              </>
                            )}

                            {order.status === "in-progress" && (
                              <>
                                <button
                                  className="chat-button"
                                  onClick={() => handleOpenChat(order)}
                                >
                                  <MessageCircle size={16} className="icon" />
                                  Chat con Cliente
                                </button>
                                <button
                                  className="complete-button"
                                  onClick={() =>
                                    handleCompleteOrderClick(order)
                                  }
                                >
                                  <CheckCircle size={16} className="icon" />
                                  Completar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab de órdenes disponibles */}
              {activeTab === "available" && (
                <div className="orders-list">
                  <h2>Órdenes Disponibles</h2>

                  {availableOrders.length === 0 ? (
                    <div className="no-orders">
                      <p>No hay órdenes disponibles en este momento.</p>
                      <p>¡Vuelve a revisar más tarde!</p>
                    </div>
                  ) : (
                    <div className="orders-grid">
                      {availableOrders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-header">
                            <div className="order-id">
                              Pedido #{order._id.substring(0, 8)}...
                            </div>
                            <div
                              className={`order-status ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          <div className="order-details">
                            <div className="order-locations">
                              <div className="pickup">
                                <strong>Recogida:</strong>{" "}
                                {order.pickupLocation}
                              </div>
                              <div className="dropoff">
                                <strong>Entrega:</strong>{" "}
                                {order.dropoffLocation}
                              </div>
                            </div>

                            <div className="order-info-row">
                              <div className="order-info-item">
                                <strong>Fecha de Creación:</strong>
                                <div>{formatDate(order.createdAt)}</div>
                              </div>
                              <div className="order-info-item">
                                <strong>Precio:</strong>
                                <div className="price">
                                  {order.price.toFixed(2)}€
                                </div>
                              </div>
                            </div>

                            <div className="order-info-row">
                              <div className="order-info-item">
                                <strong>Vehículo:</strong>
                                <div>
                                  {order.vehicleType.charAt(0).toUpperCase() +
                                    order.vehicleType.slice(1)}
                                </div>
                              </div>
                              <div className="order-info-item">
                                <strong>Tamaño del Paquete:</strong>
                                <div>
                                  {order.packageSize.charAt(0).toUpperCase() +
                                    order.packageSize.slice(1)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="order-actions">
                            <button
                              className="accept-button"
                              onClick={() => handleAcceptOrder(order._id)}
                            >
                              <CheckCircle size={16} className="icon" />
                              Aceptar Orden
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab de órdenes completadas (historial) */}
              {activeTab === "completed" && (
                <div className="orders-list">
                  <h2>Historial de Órdenes</h2>

                  {completedOrders.length === 0 ? (
                    <div className="no-orders">
                      <p>Aún no has completado ninguna orden.</p>
                    </div>
                  ) : (
                    <div className="orders-grid">
                      {completedOrders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-header">
                            <div className="order-id">
                              Pedido #{order._id.substring(0, 8)}...
                            </div>
                            <div
                              className={`order-status ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          <div className="order-details">
                            <div className="order-locations">
                              <div className="pickup">
                                <strong>Recogida:</strong>{" "}
                                {order.pickupLocation}
                              </div>
                              <div className="dropoff">
                                <strong>Entrega:</strong>{" "}
                                {order.dropoffLocation}
                              </div>
                            </div>

                            <div className="order-info-row">
                              <div className="order-info-item">
                                <strong>Completada:</strong>
                                <div>
                                  {order.completedAt
                                    ? formatDate(order.completedAt)
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="order-info-item">
                                <strong>Precio:</strong>
                                <div className="price">
                                  {order.price.toFixed(2)}€
                                </div>
                              </div>
                            </div>
                          </div>

                          {order.status === "completed" &&
                            order.proofOfDelivery && (
                              <div className="proof-section">
                                <strong>Prueba de Entrega:</strong>
                                <img
                                  src={order.proofOfDelivery}
                                  alt="Prueba de entrega"
                                  className="proof-image"
                                  onClick={() =>
                                    window.open(order.proofOfDelivery, "_blank")
                                  }
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab de notificaciones */}
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
                                // Buscar la orden y abrir chat
                                const order = [
                                  ...orders,
                                  ...completedOrders,
                                ].find(
                                  (o) =>
                                    o._id === notification.id ||
                                    o._id === notification.orderId
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

        {/* Modal de Chat */}
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
            <div className="chat-messages" ref={chatMessagesRef}>
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

                {message && (
                  <div
                    className={`completion-message ${
                      message.includes("Error")
                        ? "error"
                        : message.includes("éxito")
                        ? "success"
                        : ""
                    }`}
                  >
                    {message}
                  </div>
                )}

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
                      disabled={uploadingImage}
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-upload-area"
                    onClick={() =>
                      !uploadingImage && fileInputRef.current.click()
                    }
                    style={{
                      opacity: uploadingImage ? 0.6 : 1,
                      cursor: uploadingImage ? "not-allowed" : "pointer",
                    }}
                  >
                    <Camera size={48} className="upload-icon" />
                    <p>
                      {uploadingImage
                        ? "Subiendo..."
                        : "Haz clic para seleccionar una imagen"}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                  style={{ display: "none" }}
                  disabled={uploadingImage}
                />

                <div className="completion-modal-actions">
                  <button
                    className="button secondary"
                    onClick={handleCancelUpload}
                    disabled={uploadingImage}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button primary"
                    onClick={handleCompleteOrder}
                    disabled={!selectedImage || uploadingImage}
                  >
                    {uploadingImage ? "Procesando..." : "Completar Entrega"}
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
