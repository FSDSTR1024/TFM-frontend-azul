import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import "./UserOrders.css";
import Chat2 from "../components/Chat2";
function UserOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showChat, setShowChat] = useState(false);
  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/orders/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las órdenes");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
  const handleOpenChat = (order) => {
    if (order.status === "accepted" || order.status === "in-progress") {
      setSelectedOrder(order);
      setShowChat(true);
    }
  };
  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedOrder(null);
  };
  const handleCancelOrder = async (orderId) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta orden?")) {
      return;
    }
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
      if (!response.ok) {
        throw new Error("Error al cancelar la orden");
      }
      // Actualizar la lista de órdenes
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.message);
    }
  };
  if (loading) {
    return <div className="loading">Cargando órdenes...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <div className="user-orders">
      <div className="orders-header">
        <h2>Mis Pedidos</h2>
        <Link to="/OrderForm" className="new-order-button">
          Nueva Orden
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No tienes pedidos todavía.</p>
          <p>Crea una nueva orden para comenzar a usar el servicio.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  Pedido #{order._id.substring(0, 8)}...
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-details">
                <div className="order-locations">
                  <div className="pickup">
                    <strong>Recogida:</strong> {order.pickupLocation}
                  </div>
                  <div className="dropoff">
                    <strong>Entrega:</strong> {order.dropoffLocation}
                  </div>
                </div>

                <div className="order-info-row">
                  <div className="order-info-item">
                    <strong>Fecha de Creación:</strong>
                    <div>{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="order-info-item">
                    <strong>Precio:</strong>
                    <div className="price">{order.price.toFixed(2)}€</div>
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

              {order.status === "completed" && order.proofOfDelivery && (
                <div className="proof-section">
                  <strong>Prueba de Entrega:</strong>
                  <img
                    src={order.proofOfDelivery}
                    alt="Prueba de entrega"
                    className="proof-image"
                    onClick={() => window.open(order.proofOfDelivery, "_blank")}
                  />
                </div>
              )}

              <div className="order-actions">
                {(order.status === "accepted" ||
                  order.status === "in-progress") && (
                  <button
                    className="chat-button"
                    onClick={() => handleOpenChat(order)}
                  >
                    Chatear con Conductor
                  </button>
                )}

                {order.status === "pending" && (
                  <button
                    className="cancel-button"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancelar Orden
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showChat && selectedOrder && (
        <Chat2 order={selectedOrder} onClose={handleCloseChat} />
      )}
    </div>
  );
}
export default UserOrders;
