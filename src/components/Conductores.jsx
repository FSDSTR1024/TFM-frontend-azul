import React from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./Conductores.css";

const Conductores = () => {
  return (
    <>
      <Navbar />
      
      {/* Sección de Video */}
      <section className="video-section">
        <video autoPlay loop muted>
          <source src="/videos/conductores.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <h1>Conduce con FlashGo y Gana Más</h1>
          <p>Regístrate y empieza a generar ingresos con total flexibilidad.</p>
          <button className="cta-button">Únete Ahora</button>
        </div>
      </section>

      {/* Beneficios */}
      <section className="benefits">
        <h2>¿Por qué ser conductor de FlashGo?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">🚀 Horarios Flexibles</div>
          <div className="benefit-item">💰 Pagos Semanales</div>
          <div className="benefit-item">📱 Tecnología Avanzada</div>
          <div className="benefit-item">🚗 Tú Eliges tu Vehículo</div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="how-it-works">
        <h2>¿Cómo empezar?</h2>
        <ol>
          <li>📋 Regístrate con tus datos y vehículo.</li>
          <li>✅ Verificamos tu información.</li>
          <li>📦 Empieza a recibir pedidos y ganar dinero.</li>
        </ol>
      </section>

      {/* Vehículos aceptados */}
      <section className="vehicles">
        <h2>Tipos de Vehículos Aceptados</h2>
        <div className="vehicle-options">
          <div className="vehicle">🚴 Bicicleta</div>
          <div className="vehicle">🏍️ Moto</div>
          <div className="vehicle">🚗 Coche</div>
          <div className="vehicle">🚐 Furgoneta</div>
        </div>
      </section>

      {/* Formulario de Registro */}
      <section className="register">
        <h2>Regístrate Ahora</h2>
        <form>
          <input type="text" placeholder="Nombre Completo" />
          <input type="email" placeholder="Correo Electrónico" />
          <input type="text" placeholder="Modelo de Vehículo" />
          <button type="submit">Enviar Solicitud</button>
        </form>
      </section>

      {/* Testimonios */}
      <section className="testimonials">
        <h2>Lo que dicen nuestros conductores</h2>
        <p>🚀 "FlashGo me ha permitido trabajar cuando quiero y ganar bien." - Carlos G.</p>
        <p>📦 "Las entregas son rápidas y siempre hay pedidos disponibles." - Laura P.</p>
      </section>

      {/* Preguntas Frecuentes */}
      <section className="faq">
        <h2>Preguntas Frecuentes</h2>
        <details>
          <summary>¿Cuánto se gana?</summary>
          <p>Las ganancias dependen del número de entregas que hagas. Cuanto más trabajas, más ganas.</p>
        </details>
        <details>
          <summary>¿Necesito experiencia previa?</summary>
          <p>No, solo necesitas un vehículo y ganas de trabajar.</p>
        </details>
      </section>

      <Footer />
    </>
  );
};

export default Conductores;

