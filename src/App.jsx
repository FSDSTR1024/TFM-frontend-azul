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
import ChatMonitor from "./components/ChatMonitor";
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
          <Route path="/chat-monitor" element={<ChatMonitor />} />
          <Route path="/driverprofile" element={<DriverProfile />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/companyprofile" element={<CompanyProfile />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/orderform" element={<OrderForm />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/driverpage" element={<DriverPage />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/userorders" element={<UserOrders />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/chat2" element={<Chat2 />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          <Route path="/precios" element={<Precios />} />{" "}
          {/* Cambiado a minúsculas para consistencia */}
          {/* Rutas adicionales para la funcionalidad de órdenes de drivers */}
          <Route path="/available-orders" element={<DriverProfile />} />{" "}
          {/* Temporalmente usa DriverProfile */}
          <Route path="/orders/:orderId" element={<DriverProfile />} />{" "}
          {/* Temporalmente usa DriverProfile */}
          <Route
            path="/orders/:orderId/complete"
            element={<DriverProfile />}
          />{" "}
          {/* Temporalmente usa DriverProfile */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
