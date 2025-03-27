import React from "react";
import "./MainPage2.css";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export const MainPage2 = () => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate("/SignUp");
  };

  return (
    <div className="main-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-landing">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Envíos Rápidos y Seguros
              <span className="hero-subtitle">Con FlashGo, Tu Paquete Siempre Llega</span>
            </h1>
            
            <p className="hero-description">
              Revolucionamos la logística de entregas. Conectamos personas y 
              negocios con soluciones de envío inteligentes y personalizadas.
            </p>
            
            <div className="hero-cta">
              <button 
                className="btn-primary" 
                onClick={handleAction}
              >
                Comienza Ahora
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate("/Precios")}
              >
                Conoce Nuestros Precios
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="delivery-animation">
              <div className="package package-1"></div>
              <div className="package package-2"></div>
              <div className="package package-3"></div>
              <div className="vehicle"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefit">
            <div className="benefit-icon">🚚</div>
            <h3>Entregas Rápidas</h3>
            <p>Envíos express en tiempo récord</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon">🛡️</div>
            <h3>Seguridad Garantizada</h3>
            <p>Tus paquetes siempre protegidos</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon">📍</div>
            <h3>Cobertura Total</h3>
            <p>Servicio en múltiples ciudades</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon">💻</div>
            <h3>Seguimiento Online</h3>
            <p>Controla tu envío en tiempo real</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MainPage2;