import React, { useState } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./Precios.css";
const Precios = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    delivery: "",
    vehicle: "",
    details: "",
  });
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Cotización enviada correctamente. Revisa tu correo.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          pickup: "",
          delivery: "",
          vehicle: "",
          details: "",
        });
      } else {
        setMessage("Error enviando la cotización.");
      }
    } catch (error) {
      console.error("Error al enviar cotización:", error);
      setMessage("Hubo un error al enviar tu solicitud.");
    }
  };
  return (
    <>
      <Navbar />
      <section className="cotizacion">
        <h2>Solicita una Cotización</h2>
        <form className="cotizacion-form" onSubmit={handleSubmit}>
          <label>Nombre Completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <label>Dirección de Recogida</label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            required
          />
          <label>Dirección de Entrega</label>
          <input
            type="text"
            name="delivery"
            value={formData.delivery}
            onChange={handleChange}
            required
          />
          <label>Tipo de Vehículo</label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un tipo de vehículo</option>
            <option value="A Pie">:walking: A Pie</option>
            <option value="Bicicleta">:bicyclist: Bicicleta</option>
            <option value="Coche">:car: Coche</option>
            <option value="Furgoneta">:minibus: Furgoneta</option>
          </select>
          <label>Detalles Adicionales</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
          />
          <button type="submit">Solicitar Cotización</button>
        </form>
        {message && <p className="mensaje">{message}</p>}
      </section>
      <Footer />
    </>
  );
};
export default Precios;
