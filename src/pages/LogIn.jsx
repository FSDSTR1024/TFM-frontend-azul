import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import "./LogIn.css";
export const LogIn = ({ closeModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext); // Accedemos a la función login del contexto
  const validateForm = () => {
    let newErrors = {};
    if (!email.includes("@")) newErrors.email = "Ingrese un email válido.";
    if (password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const response = await login(email, password); // Llamamos a la función login del contexto
    if (response.success) {
      closeModal();

      // Use user from AuthContext (which will now be set)
      const userType = response.user?.userType;

      switch (userType) {
        case "driver":
          navigate("/driverprofile");
          break;
        case "company":
          navigate("/companyprofile");
          break;
        default:
          navigate("/userprofile");
      }
    }
  };
  return (
    <>
      {/* Fondo Oscuro */}
      <div className="overlay" onClick={closeModal}></div>
      {/* Modal de Login */}
      <div className="login-modal">
        <button className="close-button" onClick={closeModal}>
          X
        </button>
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
          {errors.message && <p className="error">{errors.message}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
};
export default LogIn;
