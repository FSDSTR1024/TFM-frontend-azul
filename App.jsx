import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { MainPage2 } from "./pages/MainPage2";
import { LogIn } from "./pages/LogIn";
import { SignUp } from "./pages/SignUp";
import UserProfile from "./components/UserProfile";
import DriverProfile from "./components/DriverProfile";
import Driver from "./components/Driver";
import OrderPage from "./components/OrderPage";
import Chat2 from "./components/Chat2";
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage2 />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/Driver" element={<Driver />} />
          <Route path="/DriverProfile" element={<DriverProfile />} />
          <Route path="/OrderPage" element={<OrderPage />} />
          <Route path="/Chat2" element={<Chat2 />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
