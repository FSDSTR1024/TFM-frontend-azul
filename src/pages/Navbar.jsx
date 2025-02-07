import React, { useState } from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import LogIn from "./LogIn"; // Importamos el Login

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Estado para mostrar el popup de Login

  return (
    <>
      {/* Navbar Superior */}
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
        <li><Link to="/empresas">Empresas</Link></li>
    <li><Link to="/particulares">Particulares</Link></li>
    <li><Link to="/conductores">Conductores</Link></li>
    <li><Link to="/precios">Precios</Link></li>
    <li><Link to="/SignUp">Regístrate</Link></li>
    <li><Link to="/UserProfile">Mi Perfil</Link></li>
        </ul>

        {/* Botón para abrir Login Popup */}
        <div className="login-section">
          <button className="login-toggle" onClick={() => setIsLoginOpen(true)}>
            <FontAwesomeIcon icon={faUser} /> Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Popup Login */}
      {isLoginOpen && <LogIn closeModal={() => setIsLoginOpen(false)} />}
    </>
  );
};

export default Navbar;


