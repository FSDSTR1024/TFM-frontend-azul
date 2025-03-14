import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { MainPage2 } from "./pages/MainPage2";
import { LogIn } from "./pages/LogIn";
import { SignUp } from "./pages/SignUp";
import UserProfile from "./components/UserProfile";
//import OrderPage from "./components/OrderPage";
import OrderForm from "./components/OrderForm";
import DriverProfile from "./components/DriverProfile";
import CompanyProfile from "./components/CompanyProfile";
import DriverPage from "./components/DriverPage";
import Precios from "./components/Precios";
import UserOrders from "./components/UserOrders";

import Chat2 from "./components/Chat2";
import { AuthProvider } from "./components/AuthContext";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<MainPage2 />} />
          {/* Páginas de la Navbar */}
          {/* Autenticación y Perfil */}
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/Driverprofile" element={<DriverProfile />} />
          <Route path="/Companyprofile" element={<CompanyProfile />} />
          <Route path="/OrderForm" element={<OrderForm />} /> {/* Nueva ruta */}
          <Route path="/DriverPage" element={<DriverPage />} />
          <Route path="/UserOrders" element={<UserOrders />} />
          <Route path="/Chat2" element={<Chat2 />} />
          <Route path="/Precios" element={<Precios />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
