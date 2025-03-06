import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    // Conectar con el servidor WebSocket
    const newSocket = io("http://localhost:5000", { withCredentials: true });
    setSocket(newSocket);
    // :fire: Escuchar cuando un usuario inicia sesión en otro lado
    newSocket.on("userLoggedIn", (userData) => {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    });
    // :fire: Escuchar cuando un usuario cierra sesión
    newSocket.on("userLoggedOut", () => {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    });
    return () => newSocket.close(); // Cerrar conexión cuando se desmonta el componente
  }, []);
  // :fire: Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setToken(data.token);
      }
      return data;
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        message: "Error en la conexión con el servidor",
      };
    }
  };
  // :fire: Función para cerrar sesión
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: user?.firstName,
          lastName: user?.lastName,
        }),
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      // :fire: Notificar a través de WebSockets
      if (socket) socket.emit("userLoggedOut");
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };
  // :fire: Función para obtener el perfil del usuario autenticado
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, fetchUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
