import React, { useState, useContext, useEffect } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import { Link } from "react-router-dom";
import Chat2 from "../components/Chat2";
import "./UserProfile.css";
function UserProfile() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    fetchUserProfile();
    fetch("http://localhost:5000/api/orders/user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
    fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, []);
  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }
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
                <ul>
                  {orders.map((order) => (
                    <li key={order._id}>
                      Pedido #{order._id} - {order.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tienes pedidos todavía.</p>
              )}
            </div>
          )}
          {activeSection === "notifications" && (
            <div className="notifications">
              <h2>Notificaciones</h2>
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((notif, index) => (
                    <li key={index}>{notif.message}</li>
                  ))}
                </ul>
              ) : (
                <p>No tienes notificaciones.</p>
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
