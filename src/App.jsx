import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { MainPage2 } from "./pages/MainPage2";
import { LogIn } from "./pages/LogIn";
import { SignUp } from "./pages/SignUp";
import UserProfile from "./components/UserProfile";
import Empresas from "./components/Empresas";
import Particulares from "./components/Particulares";
import Conductores from "./components/Conductores";
import Precios from "./components/Precios";

function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<MainPage2 />} />

        {/* Páginas de la Navbar */}
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/particulares" element={<Particulares />} />
        <Route path="/conductores" element={<Conductores />} />
        <Route path="/precios" element={<Precios />} />

        {/* Autenticación y Perfil */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/userprofile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
