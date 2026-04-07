// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProfile from "./pages/ProviderProfile";
import BookingFlow from "./pages/BookingFlow";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import PaymentCallback from "./pages/PaymentCallback";
import BrowseServices from "./pages/BrowseServices";
import AboutUs from "./pages/AboutUs";

// Route guard — redirects to login if not authenticated
function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/browse" element={<BrowseServices />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/book/:providerId" element={
              <Protected role="CUSTOMER"><BookingFlow /></Protected>
            } />
            <Route path="/dashboard" element={
              <Protected role="CUSTOMER"><CustomerDashboard /></Protected>
            } />
            <Route path="/provider-dashboard" element={
              <Protected role="PROVIDER"><ProviderDashboard /></Protected>
            } />
            <Route path="/admin" element={
              <Protected role="ADMIN"><AdminPanel /></Protected>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}




// Inside <Routes>
