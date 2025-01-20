// src/components/MainPage.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "./MainPage.css";

function MainPage() {
  return (
    <div className="main-page">
      {/* Navbar */}
      <header className="navbar">
      <img className="menu-icon" src="logo.png" alt="logotipo" />
      <div className="logo">FlashGo</div>
        <nav>
          <ul className="nav-links">
            <li><a href="#business">Empresas</a></li>
            <li><a href="#personal">Particulares</a></li>
            <li><a href="#driver">Conductores</a></li>
            <li><a href="#pricing">Precios</a></li>
          </ul>
        </nav>
        <div className="auth-links">
          <a href="#login">Iniciar Sesión</a>
          <button>Regístrate</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Envíos Rápidos y Seguros con FlashGo</h1>
        <p>Plataforma de envíos a demanda. Escoge tu método ideal y comienza ahora.</p>
        <button className="btn-primary">Reserva Ahora</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <h3>FlashGo</h3>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Servicios</h4>
              <ul>
                <li><a href="#business">Empresas</a></li>
                <li><a href="#personal">Particulares</a></li>
                <li><a href="#driver">Conductores</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Compañía</h4>
              <ul>
                <li><a href="#about">Sobre Nosotros</a></li>
                <li><a href="#contact">Contacto</a></li>
                <li><a href="#careers">Carreras</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Política de Privacidad</a></li>
                <li><a href="#terms">Términos y Condiciones</a></li>
              </ul>
            </div>
          </div>
          <div className="social-links">
            <h4>Síguenos</h4>
            <div className="icons">
              <a href="#instagram" className="social-icon">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#facebook" className="social-icon">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#linkedin" className="social-icon">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 FlashGo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;



