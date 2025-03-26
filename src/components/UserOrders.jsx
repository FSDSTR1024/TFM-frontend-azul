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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  // Fetch orders with pagination and filtering
  const fetchOrders = async (reset = false) => {
    try {
      setLoading(true);

      // Reset page if filtering changes
      const currentPage = reset ? 1 : page;

      // Build query params
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("page", currentPage);
      params.append("limit", 5); // 5 orders per page

      const response = await fetch(
        `http://localhost:5000/api/orders/user?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener las órdenes");
      }
      const data = await response.json();

      // If reset, replace orders, otherwise append
      if (reset) {
        setOrders(data.orders);
        setPage(1);
      } else {
        setOrders((prev) => [...prev, ...data.orders]);
      }

      // Check if there are more orders to load
      setHasMoreOrders(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Initial fetch
  useEffect(() => {
    fetchOrders(true);
  }, [filterStatus]);
  // Socket connection for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");

    // Listen for order updates
    socket.on("orderUpdated", (data) => {
      if (user && data.userId === user.id) {
        // Update the order in the list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? {
                  ...order,
                  status: data.status,
                  proofOfDelivery: data.proofImage || order.proofOfDelivery,
                }
              : order
          )
        );
      }
    });

    // Listen for completed orders
    socket.on("orderCompleted", (data) => {
      if (user && data.userId === user.id) {
        // Update the order in the list with proof image
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? {
                  ...order,
                  status: "completed",
                  proofOfDelivery: data.proofImage,
                  completedAt: new Date().toISOString(),
                }
              : order
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
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
    if (!dateString) return "N/A";

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
  const handleOpenImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  const handleCloseImage = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.message);
    }
  };
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
    fetchOrders();
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <div className="user-orders">
      <div className="orders-header">
        <h2>Mis Pedidos</h2>
        <div className="orders-actions">
          <div className="filter-dropdown">
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="status-filter"
            >
              <option value="">Todos los pedidos</option>
              <option value="pending">Pendientes</option>
              <option value="accepted">Aceptados</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          <Link to="/OrderForm" className="new-order-button">
            Nueva Orden
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        loading ? (
          <div className="loading">Cargando órdenes...</div>
        ) : (
          <div className="no-orders">
            <p>
              No tienes pedidos{" "}
              {filterStatus && `con estado "${getStatusText(filterStatus)}"`}.
            </p>
            <p>Crea una nueva orden para comenzar a usar el servicio.</p>
          </div>
        )
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    Pedido #{order._id.substring(0, 8)}...
                  </div>
                  <div
                    className={`order-status ${getStatusClass(order.status)}`}
                  >
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

                  {order.status === "completed" && (
                    <div className="order-info-row">
                      <div className="order-info-item">
                        <strong>Completada:</strong>
                        <div>{formatDate(order.completedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
                {order.status === "completed" && order.proofOfDelivery && (
                  <div className="proof-section">
                    <strong>Prueba de Entrega:</strong>
                    <div className="proof-image-container">
                      <img
                        src={order.proofOfDelivery}
                        alt="Prueba de entrega"
                        className="proof-image-thumbnail"
                        onClick={() => handleOpenImage(order.proofOfDelivery)}
                      />
                      <div className="image-caption">
                        Haz clic en la imagen para ampliar
                      </div>
                    </div>
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

                  <button
                    className="details-button"
                    onClick={() =>
                      (window.location.href = `/orders/${order._id}`)
                    }
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {loading && <div className="loading">Cargando más órdenes...</div>}

          {hasMoreOrders && !loading && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={handleLoadMore}>
                Cargar más pedidos
              </button>
            </div>
          )}
        </>
      )}
      {showChat && selectedOrder && (
        <Chat2 order={selectedOrder} onClose={handleCloseChat} />
      )}

      {/* Modal para ver la imagen de prueba de entrega */}
      {showImageModal && selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseImage}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal-button" onClick={handleCloseImage}>
              ×
            </button>
            <img
              src={selectedImage}
              alt="Prueba de entrega"
              className="proof-image-full"
            />
            <div className="image-modal-caption">Prueba de entrega</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default UserOrders;
