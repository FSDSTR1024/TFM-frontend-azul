import { useForm } from "react-hook-form";
import "./signUp.css";
export const SignUp = () => {
  //const SignUp = () => {
  const { register, handleSubmit, formState, watch, setValue } = useForm();

  const onHandleSubmit = () => {
    setValue("captcha", true);
    console.log("onHandleSubmit");
    fetch("http://localhost:5173", {});
  };

  const showFormState = () => {
    console.log(formState);
  };

  return (
    <div>
      <h2>Flash Go</h2>
      <h3>Hello, {watch("username")}</h3>S
      <form onSubmit={handleSubmit(onHandleSubmit)}>
        <p>Username</p>
        <input
          type="text"
          {...register("username", {
            required: { value: true, message: "El username es requerido" },
            minLength: {
              value: 4,
              message: "El username debe tener al mas 4 caracteres",
            },
          })}
        />
        {formState.errors.username && (
          <p className="error">{formState.errors.username.message}</p>
        )}
        <p>Password</p>
        <input
          type="password"
          {...register("password", {
            required: { value: true, message: "El password es requerido" },
            minLength: {
              value: 6,
              message: "El password debe tener al mas 6 caracteres",
            },
          })}
        />
        {formState.errors.password && (
          <p className="error">{formState.errors.password.message}</p>
        )}
        <p>Description</p>
        <textarea
          type="description"
          {...register("description", {
            required: {
              value: true,
              message: "El description debe tener al menos 50 caracteres",
            },
            minLength: {
              value: 50,
            },
            maxLength: {
              value: 250,
              message: "El description debe tener solo 250 caracteres",
            },
          })}
        />
        {formState.errors.description && (
          <p className="error">{formState.errors.description.message}</p>
        )}

        <p>Age</p>
        <input
          type="number"
          {...register("number", {
            required: {
              value: true,
              message: "El edad es requerido",
            },
            min: {
              value: 18,
              message: "El minimo edad es 18",
            },

            //message: "El minimo edad es 18",
            //required: { value: true, message: "El edad es requerido" },
            //min: {
            //value: 18,
            //messege: "El minimo edad es 18 caracteres",
          })}
        />
        {formState.errors.number && (
          <p className="error">{formState.errors.number.message}</p>
        )}

        <button type="submit">Entrar</button>
      </form>
      <button onClick={showFormState}>Show Form State</button>
      <p>{JSON.stringify(watch())}</p>
    </div>
  );
};

export default SignUp;
