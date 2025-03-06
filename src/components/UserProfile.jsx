// eslint-disable-next-line no-unused-vars
import React, { useState, useContext, useEffect } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import { Link } from "react-router-dom";
import Chat2 from "../components/Chat2"; // Import the Chat component
import "./UserProfile.css";

function UserProfile() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [activeOrder, setActiveOrder] = useState(null);
  const customerId = user?._id; // Assuming user has an `_id` field

  useEffect(() => {
    fetchUserProfile();

    // Fetch active orders
    fetch("http://localhost:5000/api/orders/active", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((orders) => {
        if (orders.length > 0) {
          setActiveOrder(orders[0]); // Assuming one active order at a time
        }
      });
  }, []);

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  return (
    <div className="user-profile-container">
      <Navbar />
      <div className="main-content">
        {/* Sidebar */}
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

        {/* Sección de Contenido */}
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
              <p>
                <strong>Ciudad:</strong> {user.city}, {user.country}
              </p>
              <p>
                <strong>Código Postal:</strong> {user.zipCode}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {new Date(user.birthdate).toLocaleDateString()}
              </p>
              <button className="edit-profile-button">Modificar Datos</button>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="orders-list">
              <h2>Órdenes</h2>
              <Link to="/OrderPage" className="new-order-button">
                Hacer Nueva Orden
              </Link>
              <p>Aquí se mostrarán tus pedidos.</p>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="notifications">
              <h2>Notificaciones</h2>
              <p>Aquí aparecerán tus notificaciones.</p>
            </div>
          )}

          {activeSection === "upgrade" && (
            <div className="upgrade-form">
              <h2>Mejorar a Empresa</h2>
              <form>
                <label>Nombre de la Empresa</label>
                <input type="text" placeholder="Ej: Mi Empresa S.L." />
                <label>CIF</label>
                <input type="text" placeholder="Ej: B12345678" />
                <label>Teléfono</label>
                <input type="tel" placeholder="Ej: +34 987 654 321" />
                <label>Email</label>
                <input type="email" placeholder="empresa@example.com" />
                <label>Dirección</label>
                <input type="text" placeholder="Dirección fiscal" />
                <button type="submit">Enviar Solicitud</button>
              </form>
            </div>
          )}

          {/* Chat component will be displayed only when there's an active order */}
          {activeOrder && (
            <Chat2
              orderId={activeOrder._id}
              userId={customerId}
              receiverId={activeOrder.driverId} // Ensure driverId exists in order data
            />
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default UserProfile;
