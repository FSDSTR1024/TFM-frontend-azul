import React, { useState, useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import UserOrders from "./UserOrders";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import { Link } from "react-router-dom";
import Chat2 from "../components/Chat2";
import "./UserProfile.css";

function UserProfile() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [chatOrder, setChatOrder] = useState(null);
  const [filters, setFilters] = useState({
    vehicle: "",
    city: "",
    status: "",
  });
  const [upgradeMessage, setUpgradeMessage] = useState("");
  //const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetch("http://localhost:5000/api/orders/user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
    fetch("http://localhost:5000/api/notifications", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, []);

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  const filteredOrders = orders.filter((order) => {
    return (
      (filters.vehicle === "" || order.vehicle === filters.vehicle) &&
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
  //const handleUserOrdersClick = () => {
  // setActiveSection("mis-pedidos");
  // navigate("/UserOrders");
  // };

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
                        setFilters({ ...filters, city: e.target.value })
                      }
                      value={filters.city}
                    >
                      <option value="">Todas las ciudades</option>
                      <option value="Madrid">Madrid</option>
                      <option value="Barcelona">Barcelona</option>
                      <option value="Sevilla">Sevilla</option>
                    </select>

                    <select
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      value={filters.status}
                    >
                      <option value="">Todos los estados</option>
                      <option value="pending">pending</option>
                      <option value="En camino">En camino</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="order-item">
                        <p>
                          <strong>Pedido #{order.id}</strong>
                        </p>
                        <p>Vehículo: {order.vehicle}</p>
                        <p>Ciudad: {order.city}</p>
                        <p>Estado: {order.status}</p>
                        <button className="modify-button">
                          Modificar Dirección
                        </button>
                        <button className="cancel-button">Cancelar</button>
                        {order.status !== "Entregado" && (
                          <button
                            className="chat-button"
                            onClick={() => setChatOrder(order)}
                          >
                            Chatear con DRIVER
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-orders">
                      No hay órdenes que coincidan con los filtros.
                    </p>
                  )}
                  {chatOrder && (
                    <Chat2
                      order={chatOrder}
                      closeChat={() => setChatOrder(null)}
                    />
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
                <ul>
                  {notifications.map((notif, index) => (
                    <li key={index}>
                      {notif.message}
                      <span className="order-id">Pedido #{notif.id}:</span>
                    </li>
                  ))}
                </ul>
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
      <Footer />
    </div>
  );
}

export default UserProfile;
