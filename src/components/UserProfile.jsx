import React, { useState } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./UserProfile.css";

function UserProfile() {
    const [activeSection, setActiveSection] = useState("profile");

    // Estado para los filtros
    const [filters, setFilters] = useState({
        vehicle: "",
        city: "",
        status: ""
    });

    // Lista de órdenes simulada
    const orders = [
        { id: 1234, vehicle: "Moto", city: "Madrid", status: "En camino" },
        { id: 5678, vehicle: "Coche", city: "Barcelona", status: "Entregado" },
        { id: 9101, vehicle: "Camión", city: "Sevilla", status: "Cancelado" },
        { id: 1123, vehicle: "Moto", city: "Madrid", status: "Entregado" },
        { id: 1456, vehicle: "Coche", city: "Barcelona", status: "En camino" },
    ];

    // Filtrado de órdenes
    const filteredOrders = orders.filter(order => {
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
                {/* Sidebar */}
                <aside className="sidebar">
                    <ul>
                        <li><button onClick={() => setActiveSection("profile")}>Perfil</button></li>
                        <li><button onClick={() => setActiveSection("orders")}>Pedidos</button></li>
                        <li><button onClick={() => setActiveSection("notifications")}>Notificaciones</button></li>
                        <li><button onClick={() => setActiveSection("upgrade")}>Mejorar a Empresa</button></li>
                    </ul>
                </aside>

                {/* Sección de Contenido */}
                <section className="content-section">
                    {activeSection === "profile" && (
                        <div className="profile-info">
                            <h2>Información de Usuario</h2>
                            <p><strong>Nombre:</strong> Juan</p>
                            <p><strong>Apellido:</strong> Pérez</p>
                            <p><strong>Número de Teléfono:</strong> +34 123 456 789</p>
                            <p><strong>Email:</strong> juanperez@example.com</p>
                            <p><strong>Dirección:</strong> Calle Falsa 123, Madrid</p>
                            <button className="edit-profile-button">Modificar Datos</button>
                        </div>
                    )}

                    {activeSection === "orders" && (
                        <div className="orders-list">
                            <h2>Órdenes</h2>
                            <button className="new-order-button">
                                Hacer Nueva Orden
                            </button>
                            {/* Filtros */}
                            <div className="filters">
                                <select
                                    onChange={(e) => setFilters({ ...filters, vehicle: e.target.value })}
                                    value={filters.vehicle}
                                >
                                    <option value="">Todos los vehículos</option>
                                    <option value="Moto">Moto</option>
                                    <option value="Coche">Coche</option>
                                    <option value="Camión">Camión</option>
                                </select>

                                <select
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    value={filters.city}
                                >
                                    <option value="">Todas las ciudades</option>
                                    <option value="Madrid">Madrid</option>
                                    <option value="Barcelona">Barcelona</option>
                                    <option value="Sevilla">Sevilla</option>
                                </select>

                                <select
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    value={filters.status}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="En camino">En camino</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            {/* Lista de órdenes filtradas */}
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <div key={order.id} className="order-item">
                                        <p><strong>Pedido #{order.id}</strong></p>
                                        <p>Vehículo: {order.vehicle}</p>
                                        <p>Ciudad: {order.city}</p>
                                        <p>Estado: {order.status}</p>
                                        <button className="modify-button">Modificar Dirección</button>
                                        <button className="cancel-button">Cancelar</button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-orders">No hay órdenes que coincidan con los filtros.</p>
                            )}
                        </div>
                    )}

                    {activeSection === "notifications" && (
                       <div className="notifications">
                       <h2>Notificaciones</h2>
               
                       {/* Lista de notificaciones simuladas */}
                       <ul className="notifications-list">
                           {[
                               { id: 1234, message: "📦 Tu paquete ha sido recogido" },
                               { id: 5678, message: "🚚 Tu paquete está en camino" },
                               { id: 9101, message: "📍 Tu paquete ha sido entregado" },
                               { id: 1123, message: "⚠️ Problema con la dirección de entrega" },
                               { id: 1456, message: "✅ Tu pedido ha sido confirmado" }
                           ].map((notification, index) => (
                               <li key={index} className="notification-item">
                                   <span className="order-id">Pedido #{notification.id}:</span>
                                   <span className="notification-message">{notification.message}</span>
                               </li>
                           ))}
                       </ul>
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
            </div>
            <Footer />
        </div>
    );
}

export default UserProfile;

