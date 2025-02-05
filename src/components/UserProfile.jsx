import React, { useState } from "react";
import { Link } from "react-router-dom"; // 🔥 Importa Link correctamente
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./UserProfile.css";

function UserProfile() {
    const [activeSection, setActiveSection] = useState("profile");

    return (
        <div className="user-profile-container">
            <Navbar />
            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><button onClick={() => setActiveSection("profile")}>Perfil</button></li>
                    <li><button onClick={() => setActiveSection("orders")}>Pedidos</button></li>
                    <li><button onClick={() => setActiveSection("notifications")}>Notificaciones</button></li>
                    <li><button onClick={() => setActiveSection("upgrade")}>Mejorar a Empresa</button></li>
                </ul>
            </aside>

            {/* Content Section */}
            <section className="content-section">
                {activeSection === "profile" && (
                    <div className="profile-info">
                        <h2>Información de Usuario</h2>
                        <p><strong>Nombre:</strong> Juan</p>
                        <p><strong>Apellido:</strong> Pérez</p>
                        <p><strong>Número de Teléfono:</strong> +34 123 456 789</p>
                        <p><strong>Email:</strong> juanperez@example.com</p>
                        <p><strong>Dirección:</strong> Calle Falsa 123, Madrid</p>
                    </div>
                )}

                {activeSection === "orders" && (
                    <div className="orders-list">
                        <h2>Órdenes</h2>
                        <div className="order-item">
                            <p><strong>Pedido #1234</strong></p>
                            <p>Estado: En camino</p>
                            <button className="modify-button">Modificar Dirección</button>
                            <button className="cancel-button">Cancelar</button>
                        </div>
                        <div className="order-item">
                            <p><strong>Pedido #5678</strong></p>
                            <p>Estado: Entregado</p>
                            <button className="modify-button">Modificar Dirección</button>
                            <button className="cancel-button">Cancelar</button>
                        </div>
                    </div>
                )}

                {activeSection === "notifications" && (
                    <div className="notifications">
                        <h2>Notificaciones</h2>
                        <div className="notification-item">📦 Tu paquete ha sido recogido</div>
                        <div className="notification-item">🚚 Tu paquete está a punto de ser entregado</div>
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
            </section>
            <Footer />
        </div>
    );
}

export default UserProfile;

