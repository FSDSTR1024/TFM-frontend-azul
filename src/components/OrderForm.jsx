import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "./OrderForm.css";
mapboxgl.accessToken =
  "pk.eyJ1IjoiamFkcmlhbmdwIiwiYSI6ImNtN3hxZm9nczAxdmkyaXFzbGk0b28xNHUifQ.svXLzJIXxrcOeC2ldaw0Jg";
const OrderForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [dimensions, setDimensions] = useState("");
  const [weight, setWeight] = useState("");
  const [vehicleType, setVehicleType] = useState("Bici");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (pickupLocation && deliveryLocation && vehicleType) {
      const baseRates = { Bici: 5, Coche: 10, Furgoneta: 15 };
      setPrice(baseRates[vehicleType]);
    }
  }, [pickupLocation, deliveryLocation, vehicleType]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Error: usuario no autenticado. Por favor, inicia sesión primero.");
      navigate("/login");
      return;
    }
    if (
      !pickupLocation ||
      !deliveryLocation ||
      !contactPhone ||
      !pickupTime ||
      !deliveryTime ||
      !dimensions ||
      !weight ||
      !paymentMethod ||
      !vehicleType ||
      !notes
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    const orderData = {
      userId: user.id,
      pickupLocation,
      deliveryLocation,
      pickupTime,
      deliveryTime,
      notes,
      contactPhone,
      paymentMethod,
      dimensions,
      weight,
      vehicleType,
      price,
    };
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error("Error al crear la orden");
      }
      alert("Orden creada exitosamente");
      navigate("/UserProfile");
    } catch (error) {
      console.error("Error creando orden:", error);
      setError("Error al crear la orden. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="order-container">
        <h2>Crear Orden</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dirección de Recogida</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Dirección de Entrega</label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Hora de Recogida</label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Hora de Entrega</label>
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono de Contacto</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Dimensiones del Paquete</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Peso del Paquete (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Vehículo</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="Bici">Bici</option>
              <option value="Coche">Coche</option>
              <option value="Furgoneta">Furgoneta</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notas para el Conductor</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>
          <div className="price-display">
            <p>
              Precio estimado: <strong>{price.toFixed(2)}€</strong>
            </p>
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Procesando..." : "Realizar Pedido"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};
export default OrderForm;
