import { useForm } from "react-hook-form";
import { useState } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./SignUp.css";

export const SignUp = () => {
  const { register, handleSubmit, formState, watch } = useForm();
  const [previewDNI, setPreviewDNI] = useState(null);
  const [previewVehicle, setPreviewVehicle] = useState(null);

  const userType = watch("userType");

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    console.log("Formulario enviado:", data);
    alert("Registro exitoso 🚀");
  };

  return (
    <div className="signup-container">
      <Navbar />
      <div className="signup-form">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Datos Básicos */}
          <label>Nombre</label>
          <input type="text" {...register("firstName", { required: "El nombre es obligatorio" })} />
          {formState.errors.firstName && <p className="error">{formState.errors.firstName.message}</p>}

          <label>Apellidos</label>
          <input type="text" {...register("lastName", { required: "Los apellidos son obligatorios" })} />
          {formState.errors.lastName && <p className="error">{formState.errors.lastName.message}</p>}

          <label>Email</label>
          <input type="email" {...register("email", { required: "El email es obligatorio" })} />
          {formState.errors.email && <p className="error">{formState.errors.email.message}</p>}

          <label>Número de Teléfono</label>
          <input type="tel" {...register("phone", { required: "El teléfono es obligatorio" })} />
          {formState.errors.phone && <p className="error">{formState.errors.phone.message}</p>}

          <label>Fecha de Nacimiento</label>
          <input type="date" {...register("birthdate", { required: "La fecha de nacimiento es obligatoria" })} />
          {formState.errors.birthdate && <p className="error">{formState.errors.birthdate.message}</p>}

          {/* Tipo de Cliente */}
          <label>Tipo de Cliente</label>
          <select {...register("userType", { required: "Seleccione un tipo de cliente" })}>
            <option value="">Seleccione...</option>
            <option value="driver">Driver</option>
            <option value="customer">Cliente Normal</option>
            <option value="company">Empresa</option>
          </select>
          {formState.errors.userType && <p className="error">{formState.errors.userType.message}</p>}

          {/* Campos adicionales para Drivers */}
          {userType === "driver" && (
            <>
              <label>Tipo de Vehículo</label>
              <input type="text" {...register("vehicleType", { required: "Ingrese su tipo de vehículo" })} />

              <label>Ciudad de Trabajo</label>
              <input type="text" {...register("workCity", { required: "Ingrese la ciudad donde trabajará" })} />

              <label>Subir Foto de DNI</label>
              <input type="file" accept="image/*" {...register("dniImage", { required: "Suba una foto de su DNI" })} onChange={(e) => handleImageChange(e, setPreviewDNI)} />
              {previewDNI && <img src={previewDNI} alt="DNI Preview" className="preview-image" />}

              <label>Subir Foto del Vehículo</label>
              <input type="file" accept="image/*" {...register("vehicleImage", { required: "Suba una foto de su vehículo" })} onChange={(e) => handleImageChange(e, setPreviewVehicle)} />
              {previewVehicle && <img src={previewVehicle} alt="Vehículo Preview" className="preview-image" />}
            </>
          )}

          {/* Campo adicional para Empresas */}
          {userType === "company" && (
            <>
              <label>CIF</label>
              <input type="text" {...register("cif", { required: "Ingrese su CIF" })} />
            </>
          )}

          {/* Contraseña */}
          <label>Contraseña</label>
          <input type="password" {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Debe tener al menos 6 caracteres" } })} />
          {formState.errors.password && <p className="error">{formState.errors.password.message}</p>}

          <label>Confirmar Contraseña</label>
          <input type="password" {...register("confirmPassword", { required: "Confirme su contraseña" })} />
          {formState.errors.confirmPassword && <p className="error">{formState.errors.confirmPassword.message}</p>}

          <button type="submit">Registrarse</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
