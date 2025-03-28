import React, { useState, useContext, useEffect } from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import LogIn from "./LogIn";
import { AuthContext } from "../components/AuthContext";
import { io } from "socket.io-client";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, setUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io("http://localhost:5000", { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("userLoggedIn", (userData) => {
      setUser(userData);
    });

    newSocket.on("userLoggedOut", () => {
      setUser(null);
      navigate("/MainPage2");
    });

    return () => newSocket.close();
  }, [setUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/MainPage2");
    setMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  // Función para determinar la ruta del perfil según el tipo de usuario
  const getProfileRoute = () => {
    if (!user) return "/UserProfile"; // Valor por defecto
    
    switch (user.userType) {
      case "driver":
        return "/DriverProfile";
      case "company":
        return "/CompanyProfile";
      default:
        return "/UserProfile";
    }
  };

  const handleProfileClick = () => {
    handleCloseMenu(); // Cerrar el menú
    navigate(getProfileRoute()); // Navegar a la ruta correspondiente
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <button 
            className="menu-toggle" 
            onClick={handleMenuToggle}
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
          <div className="logo">FastGo</div>
        </div>
        <div className="navbar-right">
          {!user && (
            <button 
              className="login-toggle" 
              onClick={() => setIsLoginOpen(true)}
            >
              <FontAwesomeIcon icon={faUser} /> Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <nav className={`side-menu ${menuOpen ? "open" : ""}`}>
        <div className="side-menu-close" onClick={handleCloseMenu}>
          <FontAwesomeIcon icon={faTimes} />
        </div>
        <ul>
          <li onClick={handleCloseMenu}>
            <Link to="/MainPage2">Inicio</Link>
          </li>
          <li onClick={handleCloseMenu}>
            <Link to="/Precios">Precios</Link>
          </li>
          <li onClick={handleCloseMenu}>
            <Link to="/AboutUs">Sobre Nosotros</Link>
          </li>
          {!user && (
            <li onClick={handleCloseMenu}>
              <Link to="/SignUp">Regístrate</Link>
            </li>
          )}
          {user && (
            <>
              <li onClick={handleProfileClick}>
                <a href="#" onClick={(e) => e.preventDefault()}>Mi Perfil</a>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="logout-button"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {isLoginOpen && <LogIn closeModal={() => setIsLoginOpen(false)} />}
    </>
  );
};

export default Navbar;