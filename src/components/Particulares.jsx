import React from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./Particulares.css";

const Particulares = () => {
  return (
    <div className="particulares-page">
      <Navbar />

      {/* 🎬 Hero con Video de Fondo */}
      <section className="hero-section">
        <video autoPlay muted loop className="background-video">
          <source src="/videos/particulares.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1>Envíos Rápidos y Seguros para Todos</h1>
          <p>
            En FlashGo nos encargamos de tus paquetes con la máxima seguridad y
            rapidez.
          </p>
          <button className="cta-button">Empieza Ahora</button>
        </div>
      </section>

      {/* 📦 Beneficios para Particulares */}
      <section className="benefits-section">
        <h2>¿Por qué elegirnos?</h2>
        <div className="benefits-container">
          <div className="benefit">
            <h3>📦 Envíos en el Día</h3>
            <p>
              Recoge y entrega tu paquete el mismo día con nuestra red de
              mensajeros.
            </p>
          </div>
          <div className="benefit">
            <h3>📍 Seguimiento en Tiempo Real</h3>
            <p>Monitorea tu paquete en cualquier momento desde la app.</p>
          </div>
          <div className="benefit">
            <h3>💳 Pago Seguro</h3>
            <p>Opciones de pago flexibles y seguras para mayor comodidad.</p>
          </div>
        </div>
      </section>

      {/* 🔄 Proceso de Uso */}
      <section className="process-section">
        <h2>Cómo Funciona</h2>
        <div className="process-steps">
          <div className="step">📝 Regístrate en la plataforma</div>
          <div className="step">
            📍 Ingresa la dirección de recogida y entrega
          </div>
          <div className="step">🚚 Escoge el tipo de transporte</div>
          <div className="step">📦 ¡Tu paquete está en camino!</div>
        </div>
      </section>

      {/* ⭐ Testimonios */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials">
          <blockquote>
            “FlashGo me ha salvado varias veces con entregas de último minuto.
            ¡Increíble servicio!”
            <br />
            <strong>- Andrea M.</strong>
          </blockquote>
          <blockquote>
            “Seguro, rápido y confiable. Siempre confío en FlashGo para mis
            envíos personales.”
            <br />
            <strong>- Carlos G.</strong>
          </blockquote>
        </div>
      </section>

      {/* ❓ Preguntas Frecuentes */}
      <section className="faq-section">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq">
          <details>
            <summary>¿Cuánto tiempo tarda un envío?</summary>
            <p>
              Ofrecemos entregas el mismo día en la mayoría de las ciudades
              principales.
            </p>
          </details>
          <details>
            <summary>¿Cómo realizo un seguimiento de mi paquete?</summary>
            <p>Desde nuestra app puedes ver la ubicación en tiempo real.</p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Particulares;
