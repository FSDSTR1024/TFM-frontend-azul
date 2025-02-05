import React, { useState } from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">FlashGo</div>

        {/* Botón de menú lateral */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      </header>

      {/* Menú lateral */}
      <nav className={`side-menu ${menuOpen ? "open" : ""}`}>
        <ul>
          <li><a href="#business">Empresas</a></li>
          <li><a href="#personal">Particulares</a></li>
          <li><a href="#driver">Conductores</a></li>
          <li><a href="#pricing">Precios</a></li>
          <li><a href="/LogIn">Iniciar Sesión</a></li>
          <li><a href="/SignUp">Regístrate</a></li>
          <li><Link to="/UserProfile">Mi Perfil</Link></li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
