import React, { useState } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./Precios.css";

const Precios = () => {
  const [peso, setPeso] = useState("");
  const [distancia, setDistancia] = useState("");
  const [precioEstimado, setPrecioEstimado] = useState(null);

  const calcularPrecio = () => {
    if (!peso || !distancia) {
      alert("Por favor, ingrese el peso y la distancia.");
      return;
    }
    const precio = (peso * 0.5 + distancia * 0.3).toFixed(2);
    setPrecioEstimado(precio);
  };

  return (
    <>
      <Navbar />

      {/* 🎬 Video Introductorio */}
      <section className="video-section">
        <video autoPlay loop muted>
          <source src="/videos/precios.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <h1>Precios y Servicios de Transporte</h1>
          <p>Envíos rápidos y seguros al mejor precio.</p>
        </div>
      </section>

      {/* 📸 Galería de Artículos Transportables */}
      <section className="galeria">
        <h2>¿Qué transportamos?</h2>
        <div className="categorias">
          <div className="categoria">
            <h3>📱 Electrónica</h3>
            <img src="/images/electronica.jpg" alt="Electrónica" />
          </div>
          <div className="categoria">
            <h3>🛋️ Muebles</h3>
            <img src="/images/muebles.jpg" alt="Muebles" />
          </div>
          <div className="categoria">
            <h3>📑 Documentos</h3>
            <img src="/images/documentos.jpg" alt="Documentos" />
          </div>
          <div className="categoria">
            <h3>🥦 Alimentos</h3>
            <img src="/images/alimentos.jpg" alt="Alimentos" />
          </div>
        </div>
      </section>

      {/* 🚚 Tipos de Vehículos y su Capacidad */}
      <section className="vehiculos">
        <h2>Vehículos y su Capacidad</h2>
        <div className="vehiculos-container">
          <div className="vehiculo">
            <h3>🚶 Andando</h3>
            <p>📦 Cargas pequeñas hasta 5kg</p>
          </div>
          <div className="vehiculo">
            <h3>🚴 Bicicleta</h3>
            <p>📦 Hasta 20kg, ideal para documentos y paquetes medianos</p>
          </div>
          <div className="vehiculo">
            <h3>🚗 Coche</h3>
            <p>📦 Hasta 100kg, perfecto para cajas y productos frágiles</p>
          </div>
          <div className="vehiculo">
            <h3>🚐 Furgoneta</h3>
            <p>📦 Hasta 500kg, para grandes volúmenes y muebles</p>
          </div>
        </div>
      </section>

      {/* 🖩 Calculadora de Precios */}
      <section className="calculadora">
        <h2>Calcula tu Envío</h2>
        <div className="calculadora-form">
          <input
            type="number"
            placeholder="Peso (kg)"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
          <input
            type="number"
            placeholder="Distancia (km)"
            value={distancia}
            onChange={(e) => setDistancia(e.target.value)}
          />
          <button onClick={calcularPrecio}>Calcular</button>
        </div>
        {precioEstimado && (
          <p className="resultado">
            Precio Estimado: <strong>{precioEstimado}€</strong>
          </p>
        )}
      </section>

      {/* 📝 Formulario de Cotización - Estilo Vertical */}
      <section className="cotizacion">
        <h2>Solicita una Cotización</h2>
        <form className="cotizacion-form">
          <label>Nombre Completo</label>
          <input type="text" placeholder="Ej: Juan Pérez" />

          <label>Correo Electrónico</label>
          <input type="email" placeholder="Ej: juanperez@email.com" />

          <label>Teléfono</label>
          <input type="tel" placeholder="Ej: +34 678 123 456" />

          <label>Dirección de Recogida</label>
          <input type="text" placeholder="Ej: Calle Gran Vía, Madrid" />

          <label>Dirección de Entrega</label>
          <input type="text" placeholder="Ej: Calle Serrano, Madrid" />

          <label>Tipo de Vehículo</label>
          <select>
            <option value="">Selecciona un tipo de vehículo</option>
            <option value="A Pie">🚶 A Pie</option>
            <option value="Bicicleta">🚴 Bicicleta</option>
            <option value="Coche">🚗 Coche</option>
            <option value="Furgoneta">🚐 Furgoneta</option>
          </select>

          <label>Detalles Adicionales</label>
          <textarea placeholder="Ej: Necesito entrega urgente o frágil"></textarea>

          <button type="submit">Solicitar Cotización</button>
        </form>
      </section>

      <Footer />
    </>
  );
};

export default Precios;
