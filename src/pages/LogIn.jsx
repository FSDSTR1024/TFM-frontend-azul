import { useState } from "react";
import "./LogIn.css";

export const LogIn = ({ closeModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!email.includes("@")) newErrors.email = "Ingrese un email válido.";
    if (password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Si hay errores, no se envía

    const response = await fetch("http://localhost:3000/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    alert("Inicio de sesión exitoso 🚀");
    closeModal(); // Cerrar modal tras iniciar sesión
  };

  return (
    <>
      {/* Fondo Oscuro */}
      <div className="overlay" onClick={closeModal}></div>

      {/* Modal de Login */}
      <div className="login-modal">
        <button className="close-button" onClick={closeModal}>X</button>
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Introduce tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
};

export default LogIn;


