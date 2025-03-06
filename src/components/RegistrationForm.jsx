// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./RegistrationForm.css";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "El nombre es obligatorio";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio";
    if (!formData.email.includes("@"))
      newErrors.email = "Ingrese un email válido";
    if (formData.phone.length < 9) newErrors.phone = "Teléfono inválido";
    if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Registro exitoso 🚀");
      // Aquí podrías enviar los datos al backend
    }
  };

  return (
    <div className="registration-container">
      <Navbar />
      <div className="registration-form">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && (
            <span className="error">{errors.firstName}</span>
          )}

          <label>Apellido</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}

          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <label>Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}

          <button type="submit">Registrarse</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default RegistrationForm;
