import React, { useEffect } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./Empresas.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faRocket,
  faTruck,
  faUsers,
  faShieldAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import scrollreveal from "scrollreveal";

const Empresas = () => {
  useEffect(() => {
    scrollreveal().reveal(".reveal", {
      origin: "bottom",
      distance: "50px",
      duration: 800,
      easing: "ease-in-out",
      reset: false,
    });
  }, []);

  return (
    <div className="empresas-page">
      <Navbar />

      {/* 🎬 Hero con Video */}
      <section className="hero-section">
        <video autoPlay loop muted>
          <source src="/assets/empresas-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1 className="reveal">Haz Crecer tu Empresa con FlashGo</h1>
          <p className="reveal">
            La solución logística más rápida y segura para tus envíos
            empresariales.
          </p>
          <button className="cta-button reveal">Solicita una Demo</button>
        </div>
      </section>

      {/* 📈 Beneficios */}
      <section className="benefits-section reveal">
        <h2>¿Por qué elegirnos?</h2>
        <p className="description">
          En FlashGo, transformamos la logística para empresas con tecnología
          avanzada, monitoreo en tiempo real y una red de transporte eficiente.
          Aquí tienes algunas razones para trabajar con nosotros:
        </p>
        <div className="benefits-container">
          <div className="benefit-box">
            <FontAwesomeIcon icon={faRocket} className="icon" />
            <h3>Optimización Logística</h3>
            <p>
              Reducción de costos y tiempos de entrega, asegurando la máxima
              eficiencia.
            </p>
          </div>
          <div className="benefit-box">
            <FontAwesomeIcon icon={faBox} className="icon" />
            <h3>Seguridad y Control</h3>
            <p>
              Monitoreo en tiempo real de cada envío, con notificaciones
              automáticas.
            </p>
          </div>
          <div className="benefit-box">
            <FontAwesomeIcon icon={faTruck} className="icon" />
            <h3>Flota Moderna</h3>
            <p>
              Disponemos de bicicletas, motos, coches y furgonetas para
              cualquier tipo de envío.
            </p>
          </div>
          <div className="benefit-box">
            <FontAwesomeIcon icon={faUsers} className="icon" />
            <h3>Atención Personalizada</h3>
            <p>
              Soporte 24/7 para resolver cualquier incidencia con tus envíos.
            </p>
          </div>
          <div className="benefit-box">
            <FontAwesomeIcon icon={faShieldAlt} className="icon" />
            <h3>Protección Garantizada</h3>
            <p>
              Cada paquete está asegurado y manejado con los mayores estándares
              de seguridad.
            </p>
          </div>
          <div className="benefit-box">
            <FontAwesomeIcon icon={faClock} className="icon" />
            <h3>Operación 24/7</h3>
            <p>Realizamos envíos en cualquier momento, sin interrupciones.</p>
          </div>
        </div>
      </section>

      {/* 🚚 Vehículos */}
      <section className="vehicles-section reveal">
        <h2>Nuestra Flota</h2>
        <p>
          Disponemos de una flota moderna y sostenible para adaptarnos a todas
          las necesidades de tu empresa.
        </p>
        <div className="vehicles-grid">
          <div className="vehicle-box">
            <img src="/assets/bike.png" alt="Bicicleta" />
            <p>Bicicleta - Ideal para zonas urbanas</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/moto.png" alt="Moto" />
            <p>Moto - Entregas rápidas en cualquier lugar</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/car.png" alt="Coche" />
            <p>Coche - Perfecto para cargas medianas</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/van.png" alt="Furgoneta" />
            <p>Furgoneta - Para grandes volúmenes de paquetes</p>
          </div>
        </div>
      </section>

      {/* ❤️ Opiniones de Clientes */}
      <section className="testimonials-section reveal">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials-slider">
          <div className="testimonial">
            <p>
              "FlashGo ha revolucionado nuestra logística. Servicio rápido y
              confiable."
            </p>
            <span>- Carlos G., CEO de TiendaExpress</span>
          </div>
          <div className="testimonial">
            <p>"Entrega impecable y monitoreo en tiempo real. 10/10."</p>
            <span>- Laura P., Gerente de Logística</span>
          </div>
        </div>
      </section>

      {/* ❓ Preguntas Frecuentes */}
      <section className="faq-section reveal">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq">
          <details>
            <summary>¿Cómo contrato el servicio?</summary>
            <p>
              Puedes registrarte en nuestra plataforma y seleccionar el plan que
              mejor se adapte a tu empresa.
            </p>
          </details>
          <details>
            <summary>¿Qué tipo de paquetes pueden enviar?</summary>
            <p>
              Transportamos desde documentos hasta cargas voluminosas. Contamos
              con distintas opciones de transporte para adaptarnos a tus
              necesidades.
            </p>
          </details>
          <details>
            <summary>¿Qué tan rápido pueden hacer las entregas?</summary>
            <p>
              Ofrecemos envíos en el mismo día dentro de la ciudad y opciones
              exprés para envíos urgentes.
            </p>
          </details>
          <details>
            <summary>¿Tienen seguimiento en tiempo real?</summary>
            <p>
              Sí, nuestra plataforma te permite monitorear la ubicación de tus
              envíos en tiempo real con actualizaciones automáticas.
            </p>
          </details>
          <details>
            <summary>¿Puedo programar entregas recurrentes?</summary>
            <p>
              ¡Por supuesto! Puedes configurar envíos programados para optimizar
              tu logística empresarial.
            </p>
          </details>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Empresas;
