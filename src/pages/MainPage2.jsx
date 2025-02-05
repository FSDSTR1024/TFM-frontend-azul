import React, { useState } from "react";
import "./MainPage2.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export const MainPage2 = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="main-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1>Envíos Rápidos y Seguros con FlashGo</h1>
        <p>Plataforma de envíos a demanda. Escoge tu método ideal y comienza ahora.</p>
        <button className="btn-primary">Reserva Ahora</button>
      </section>

      {/* Footer Importado */}
      <Footer />
    </div>
  );
};

export default MainPage2;
