// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import Chat2 from "./Chat2";
import "./UserProfile.css";
import { BarChart2Icon } from "lucide-react";

function CompanyProfile() {
  const [activeSection, setActiveSection] = useState("profile");
  const [chatOrder, setChatOrder] = useState(null);
  const [filters, setFilters] = useState({
    vehicle: "",
    city: "",
    status: "",
  });
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data based on the active section
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeSection === "orders") {
          const queryParams = new URLSearchParams(filters).toString();
          const response = await fetch(
            `http://localhost:5000/api/orders?${queryParams}`
          );
          const data = await response.json();
          setOrders(data);
        } else if (activeSection === "profile") {
          const response = await fetch("http://localhost:5000/api/profile");
          const data = await response.json();
          setProfile(data);
        } else if (activeSection === "notifications") {
          const response = await fetch(
            "http://localhost:5000/api/notifications"
          );
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activeSection, filters]);

  // Handle upgrade to company
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

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const updatedProfile = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phoneNumber: formData.get("phoneNumber"),
      email: formData.get("email"),
      address: formData.get("address"),
    };

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });
      const data = await response.json();
      setProfile(data); // Update the profile state with the new data
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    return (
      (filters.vehicle === "" || order.vehicle === filters.vehicle) &&
      (filters.city === "" || order.city === filters.city) &&
      (filters.status === "" || order.status === filters.status)
    );
  });

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
              {!isEditing ? (
                <>
                  <p>
                    <strong>Nombre:</strong> {profile.firstName}
                  </p>
                  <p>
                    <strong>Apellido:</strong> {profile.lastName}
                  </p>
                  <p>
                    <strong>Número de Teléfono:</strong> {profile.phoneNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {profile.address}
                  </p>
                  <button
                    className="edit-profile-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Modificar Datos
                  </button>
                </>
              ) : (
                <form
                  onSubmit={handleProfileUpdate}
                  className="edit-profile-form"
                >
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={profile.firstName}
                    required
                  />

                  <label>Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={profile.lastName}
                    required
                  />

                  <label>Número de Teléfono</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={profile.phoneNumber}
                    required
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={profile.email}
                    required
                  />

                  <label>Dirección</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={profile.address}
                    required
                  />

                  <button type="submit">Guardar Cambios</button>
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSection === "orders" && (
            <div className="orders-list">
              <h2>Órdenes</h2>
              <button className="new-order-button">Hacer Nueva Orden</button>
              <div className="filters">
                <select
                  onChange={(e) =>
                    setFilters({ ...filters, vehicle: e.target.value })
                  }
                  value={filters.vehicle}
                >
                  <option value="">Todos los vehículos</option>
                  <option value="Moto">Moto</option>
                  <option value="Coche">Coche</option>
                  <option value="Camión">Camión</option>
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
                <BarChart2Icon
                  order={chatOrder}
                  closeChat={() => setChatOrder(null)}
                />
              )}
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="notifications">
              <h2>Notificaciones</h2>
              <ul className="notifications-list">
                {notifications.map((notification, index) => (
                  <li key={index} className="notification-item">
                    <span className="order-id">Pedido #{notification.id}:</span>
                    <span className="notification-message">
                      {notification.message}
                    </span>
                  </li>
                ))}
              </ul>
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

export default CompanyProfile;
