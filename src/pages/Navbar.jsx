import React, { useState, useContext, useEffect } from "react";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import LogIn from "./LogIn"; // Importamos el Login
import { AuthContext } from "../components/AuthContext";
import { io } from "socket.io-client";
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, setUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate(); // :fire: Agregamos useNavigate para redirección
  useEffect(() => {
    const newSocket = io("http://localhost:5000", { withCredentials: true });
    setSocket(newSocket);
    // :fire: Escuchar cuando un usuario inicia sesión en otra pestaña
    newSocket.on("userLoggedIn", (userData) => {
      setUser(userData);
    });
    // :fire: Escuchar cuando un usuario cierra sesión en otra pestaña
    newSocket.on("userLoggedOut", () => {
      setUser(null);
      navigate("/MainPage2"); // :fire: Redirigir a la página principal tras cierre de sesión
    });
    return () => newSocket.close(); // Cerrar la conexión WebSocket al desmontar
  }, [setUser, navigate]);
  // :fire: Modificar función de logout para redirigir a la página principal
  const handleLogout = () => {
    logout();
    navigate("/"); // :fire: Redirigir al usuario a la página principal después de cerrar sesión
  };
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
          <li>
            <a href="#business">Empresas</a>
          </li>
          <li>
            <a href="#personal">Particulares</a>
          </li>
          <li>
            <Link to="/Driver">Driver</Link>
          </li>

          <li>
            <a href="#pricing">Precios</a>
          </li>
          {!user && (
            <li>
              <Link to="/SignUp">Regístrate</Link>
            </li>
          )}
          {user && (
            <li>
              <Link to="/UserProfile">Mi Perfil</Link>
            </li>
          )}
        </ul>
        {/* Estado de autenticación en la Navbar */}
        <div className="login-section">
          {user ? (
            <div className="user-info">
              <span>Hola, {user.firstName}</span>
              <button className="logout-button" onClick={handleLogout}>
                Desconectar
              </button>
            </div>
          ) : (
            <button
              className="login-toggle"
              onClick={() => setIsLoginOpen(true)}
            >
              <FontAwesomeIcon icon={faUser} /> Iniciar Sesión
            </button>
          )}
        </div>
      </nav>
      {/* Popup Login */}
      {isLoginOpen && <LogIn closeModal={() => setIsLoginOpen(false)} />}
    </>
  );
};
export default Navbar;
