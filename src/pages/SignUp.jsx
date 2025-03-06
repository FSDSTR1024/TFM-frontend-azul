import { useForm } from "react-hook-form";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { AuthContext } from "../components/AuthContext";
import "./SignUp.css";

const CLOUDINARY_UPLOAD_PRESET = "FastGo";
export const SignUp = () => {
  const { register, handleSubmit, formState, setError, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  // Estados para manejar imágenes
  const [dniImage, setDniImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  // Observar el tipo de usuario seleccionado
  const userType = watch("userType");
  // Función para manejar la subida de imágenes a Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // Reemplaza con tu `upload_preset` de Cloudinary
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/drt2lron6/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url; // Retorna la URL de la imagen subida
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Las contraseñas no coinciden",
      });
      setIsSubmitting(false);
      return;
    }
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    // :fire: Si el usuario es `Driver`, subimos imágenes a Cloudinary
    if (data.userType === "driver") {
      if (!dniImage || !vehicleImage) {
        setError("dniImage", {
          type: "manual",
          message: "Debes subir ambas imágenes.",
        });
        setIsSubmitting(false);
        return;
      }
      const dniImageUrl = await uploadImage(dniImage);
      const vehicleImageUrl = await uploadImage(vehicleImage);
      formData.append("dniImage", dniImageUrl);
      formData.append("vehicleImage", vehicleImageUrl);
    }
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData, // :fire: Ahora enviamos `FormData` en lugar de JSON
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        const loginResponse = await login(data.email, data.password);
        if (loginResponse.success) {
          if (data.userType === "driver") {
            navigate("/DriverProfile");
          } else if (data.userType === "company") {
            navigate("/CompanyProfile");
          } else {
            navigate("/UserProfile");
          }
        }
      } else {
        Object.keys(result.errors).forEach((key) => {
          setError(key, { type: "manual", message: result.errors[key] });
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al registrar el usuario. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="signup-container">
      <Navbar />
      <div className="signup-form">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <label>Nombre</label>
          <input
            type="text"
            {...register("firstName", { required: "El nombre es obligatorio" })}
          />
          <label>Apellidos</label>
          <input
            type="text"
            {...register("lastName", {
              required: "Los apellidos son obligatorios",
            })}
          />
          <label>Email</label>
          <input
            type="email"
            {...register("email", { required: "El email es obligatorio" })}
          />
          <label>Número de Teléfono</label>
          <input
            type="text"
            {...register("phoneNumber", {
              required: "El teléfono es obligatorio",
            })}
          />
          <label>Dirección</label>
          <input
            type="text"
            {...register("address", {
              required: "La dirección es obligatoria",
            })}
          />
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            {...register("birthdate", {
              required: "La fecha de nacimiento es obligatoria",
            })}
          />
          <label>Tipo de Usuario</label>
          <select
            {...register("userType", {
              required: "Seleccione un tipo de usuario",
            })}
          >
            <option value="">Seleccione...</option>
            <option value="user">Usuario Normal</option>
            <option value="driver">Driver</option>
            <option value="company">Empresa</option>
          </select>
          {/* Campos adicionales para Empresas */}
          {userType === "company" && (
            <>
              <label>CIF de Empresa</label>
              <input
                type="text"
                {...register("cif", { required: "El CIF es obligatorio" })}
              />
            </>
          )}
          {/* Campos adicionales para Drivers */}
          {userType === "driver" && (
            <>
              <label>Ciudad de Trabajo</label>
              <input
                type="text"
                {...register("workCity", {
                  required: "La ciudad de trabajo es obligatoria",
                })}
              />
              <label>Tipo de Vehículo</label>
              <select
                {...register("vehicleType", {
                  required: "El tipo de vehículo es obligatorio",
                })}
              >
                <option value="">Seleccione...</option>
                <option value="moto">Moto</option>
                <option value="coche">Coche</option>
                <option value="camion">Camión</option>
              </select>
              <label>Foto del Carnet de Conducir</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDniImage(e.target.files[0])}
              />
              <label>Foto del Coche</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setVehicleImage(e.target.files[0])}
              />
            </>
          )}
          <label>Contraseña</label>
          <input
            type="password"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "Debe tener al menos 6 caracteres",
              },
            })}
          />
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Confirme su contraseña",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};
export default SignUp;
