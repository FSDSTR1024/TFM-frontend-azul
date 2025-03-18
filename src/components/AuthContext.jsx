import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Verifica si hay un token en localStorage y establece el usuario
    const token = localStorage.getItem("token");
    if (token) {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
        } catch (error) {
          console.error("Error al parsear los datos del usuario:", error);
        }
      }
    }
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        // Almacena el token y los datos del usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        errors: { message: "Error de conexión al servidor" },
      };
    }
  };
  const logout = () => {
    // Elimina el token y los datos del usuario del almacenamiento
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
