import React, { useState, useEffect, useContext } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import { Link } from "react-router-dom";
import Chat2 from "../components/Chat2";
import axios from "axios";
import "./DriverProfile.css";
function DriverProfile() {
  const { user, fetchUserProfile } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [proofImage, setProofImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    fetchUserProfile();
    fetch("http://localhost:5000/api/orders/available", {
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
  const handleAcceptOrder = async (orderId) => {
    await fetch(`http://localhost:5000/api/orders/${orderId}/accept`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: "accepted" } : order
      )
    );
  };
  const handleUploadProof = async (orderId) => {
    if (!proofImage) {
      alert("Debes subir una imagen como prueba de entrega");
      return;
    }
    const formData = new FormData();
    formData.append("file", proofImage);
    formData.append("upload_preset", "flashgo_preset");
    try {
      const uploadResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/drt2lron6/image/upload",
        formData
      );
      const imageUrl = uploadResponse.data.secure_url;
      await fetch(`http://localhost:5000/api/orders/${orderId}/upload-proof`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ proofOfSend: imageUrl }),
      });
      alert("Prueba de entrega subida correctamente");
    } catch (error) {
      console.error("Error uploading proof image:", error);
      alert("Hubo un error al subir la imagen");
    }
  };
  return (
    <div className="driver-profile-container">
      <Navbar />
      <h2>Perfil del Conductor</h2>
      <div className="orders-section">
        <h3>Órdenes Disponibles</h3>
        {orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order._id}>
                <p>Pedido #{order._id}</p>
                <p>Recoger: {order.pickupLocation}</p>
                <p>Entregar: {order.dropoffLocation}</p>
                <p>Precio: {order.price}€</p>
                {order.status === "pending" && (
                  <button onClick={() => handleAcceptOrder(order._id)}>
                    Aceptar Orden
                  </button>
                )}
                {order.status === "accepted" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofImage(e.target.files[0])}
                    />
                    <button onClick={() => handleUploadProof(order._id)}>
                      Subir Prueba de Entrega
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay órdenes disponibles.</p>
        )}
      </div>
      <div className="notifications-section">
        <h3>Notificaciones</h3>
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
      <Footer />
    </div>
  );
}
export default DriverProfile;
