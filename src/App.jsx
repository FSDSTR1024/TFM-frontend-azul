import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { MainPage2 } from "./pages/MainPage2";
import { LogIn } from "./pages/LogIn";
import { SignUp } from "./pages/SignUp";
import UserProfile from "./components/UserProfile";
import OrderForm from "./components/OrderForm";
import DriverProfile from "./components/DriverProfile";
import CompanyProfile from "./components/CompanyProfile";
import DriverPage from "./components/DriverPage";
import Precios from "./components/Precios";
import ChatMonitor from "./components/ChatMonitor";
import UserOrders from "./components/UserOrders";
import Chat2 from "./components/Chat2";
import { AuthProvider } from "./components/AuthContext";
import AboutUs from "./pages/AboutUs"; // Import the new AboutUs page

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage2 />} />
          <Route path="/MainPage2" element={<MainPage2 />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/chat-monitor" element={<ChatMonitor />} />
          <Route path="/driverprofile" element={<DriverProfile />} />
          <Route path="/companyprofile" element={<CompanyProfile />} />
          <Route path="/orderform" element={<OrderForm />} />
          <Route path="/driverpage" element={<DriverPage />} />
          <Route path="/userorders" element={<UserOrders />} />
          <Route path="/chat2" element={<Chat2 />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/AboutUs" element={<AboutUs />} /> {/* Add the new route */}
          
          {/* Rutas adicionales para la funcionalidad de órdenes de drivers */}
          <Route path="/available-orders" element={<DriverProfile />} />
          <Route path="/orders/:orderId" element={<DriverProfile />} />
          <Route path="/orders/:orderId/complete" element={<DriverProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;