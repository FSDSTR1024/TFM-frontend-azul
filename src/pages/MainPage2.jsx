// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "./MainPage2.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faShippingFast,
  faClock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export const MainPage2 = () => {
  return (
    <div className="main-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1>Envíos Rápidos y Seguros con FlashGo</h1>
        <p>
          Plataforma de envíos a demanda. Escoge tu método ideal y comienza
          ahora.
        </p>
        <button className="btn-primary">Reserva Ahora</button>
      </section>

      {/* Sección Por qué elegirnos */}
      <section className="why-choose-us">
        <h2>¿Por qué elegir nuestros servicios?</h2>
        <div className="benefits">
          <div className="benefit">
            <FontAwesomeIcon icon={faShippingFast} className="icon" />
            <h3>Envíos Rápidos</h3>
            <p>Entregamos tus paquetes en tiempo récord.</p>
          </div>
          <div className="benefit">
            <FontAwesomeIcon icon={faShieldAlt} className="icon" />
            <h3>Seguridad Garantizada</h3>
            <p>Tu paquete estará seguro en todo momento.</p>
          </div>
          <div className="benefit">
            <FontAwesomeIcon icon={faClock} className="icon" />
            <h3>Disponibilidad 24/7</h3>
            <p>Realiza envíos en cualquier momento del día.</p>
          </div>
          <div className="benefit">
            <FontAwesomeIcon icon={faCheckCircle} className="icon" />
            <h3>Alta Satisfacción</h3>
            <p>Nuestros clientes nos recomiendan.</p>
          </div>
        </div>
        <button className="btn-try-now">Prueba ya</button>
      </section>

      {/* Sección Tipos de Vehículos */}
      <section className="vehicle-section">
        <h2>Nuestros Vehículos</h2>
        <div className="vehicle-grid">
          <div className="vehicle-box">
            <img src="/assets/walking.png" alt="Envío Andando" />
            <p>Andando</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/bike.png" alt="Envío en Bicicleta" />
            <p>Bicicleta</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/car.png" alt="Envío en Coche" />
            <p>Coche</p>
          </div>
          <div className="vehicle-box">
            <img src="/assets/van.png" alt="Envío en Furgoneta" />
            <p>Furgoneta</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainPage2;
