import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "../pages/signUp.css";

export const Driver = () => {
  const { register, handleSubmit, formState, setError } = useForm();
  const [previewDNI, setPreviewDNI] = useState(null);
  const [previewVehicle, setPreviewVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key !== "dniImage" && key !== "vehicleImage") {
        formData.append(key, data[key]);
      }
    });

    if (data.dniImage) formData.append("dniImage", data.dniImage[0]);
    if (data.vehicleImage)
      formData.append("vehicleImage", data.vehicleImage[0]);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        navigate("/profile");
      } else {
        Object.keys(result.errors).forEach((key) => {
          setError(key, {
            type: "manual",
            message: result.errors[key],
          });
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Nombre</label>
          <input
            type="text"
            {...register("firstName", { required: "El nombre es obligatorio" })}
          />
          {formState.errors.firstName && (
            <p className="error">{formState.errors.firstName.message}</p>
          )}

          <label>Apellidos</label>
          <input
            type="text"
            {...register("lastName", {
              required: "Los apellidos son obligatorios",
            })}
          />
          {formState.errors.lastName && (
            <p className="error">{formState.errors.lastName.message}</p>
          )}

          <label>Email</label>
          <input
            type="email"
            {...register("email", { required: "El email es obligatorio" })}
          />
          {formState.errors.email && (
            <p className="error">{formState.errors.email.message}</p>
          )}

          <label>Número de Teléfono</label>
          <input
            type="tel"
            {...register("phone", { required: "El teléfono es obligatorio" })}
          />
          {formState.errors.phone && (
            <p className="error">{formState.errors.phone.message}</p>
          )}

          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            {...register("birthdate", {
              required: "La fecha de nacimiento es obligatoria",
            })}
          />
          {formState.errors.birthdate && (
            <p className="error">{formState.errors.birthdate.message}</p>
          )}

          <label>Tipo de Vehículo</label>
          <input
            type="text"
            {...register("vehicleType", {
              required: "Ingrese su tipo de vehículo",
            })}
          />
          {formState.errors.vehicleType && (
            <p className="error">{formState.errors.vehicleType.message}</p>
          )}

          <label>Ciudad de Trabajo</label>
          <input
            type="text"
            {...register("workCity", {
              required: "Ingrese la ciudad donde trabajará",
            })}
          />
          {formState.errors.workCity && (
            <p className="error">{formState.errors.workCity.message}</p>
          )}

          <label>Subir Foto de DNI</label>
          <input
            type="file"
            accept="image/*"
            {...register("dniImage", { required: "Suba una foto de su DNI" })}
            onChange={(e) => handleImageChange(e, setPreviewDNI)}
          />
          {previewDNI && (
            <img src={previewDNI} alt="DNI Preview" className="preview-image" />
          )}
          {formState.errors.dniImage && (
            <p className="error">{formState.errors.dniImage.message}</p>
          )}

          <label>Subir Foto del Vehículo</label>
          <input
            type="file"
            accept="image/*"
            {...register("vehicleImage", {
              required: "Suba una foto de su vehículo",
            })}
            onChange={(e) => handleImageChange(e, setPreviewVehicle)}
          />
          {previewVehicle && (
            <img
              src={previewVehicle}
              alt="Vehículo Preview"
              className="preview-image"
            />
          )}
          {formState.errors.vehicleImage && (
            <p className="error">{formState.errors.vehicleImage.message}</p>
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
          {formState.errors.password && (
            <p className="error">{formState.errors.password.message}</p>
          )}

          <label>Confirmar Contraseña</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Confirme su contraseña",
            })}
          />
          {formState.errors.confirmPassword && (
            <p className="error">{formState.errors.confirmPassword.message}</p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Driver;
