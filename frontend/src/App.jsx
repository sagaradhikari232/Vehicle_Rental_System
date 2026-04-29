import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Auth Context Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import LandingPage from './components/pages/LandingPage'; 
import Login from './components/sections/Login';
import Signup from './components/sections/Signup';
import ForgotPassword from './components/sections/ForgetPassword';
import PaymentSuccess from './components/pages/Paymentsuccess';
import PaymentFailed from './components/pages/Paymentfailed';

// Admin Components
import DashboardLayout from './components/admin/DashboardLayout';
import Dashboard from './components/pages/admin/Dashboard';
import Vehicles from './components/pages/admin/Vehicles';
import Bookings from './components/pages/admin/Bookings';
import Users from './components/pages/admin/Users';
import Payments from './components/pages/admin/Payments';
import VehicleDetail from './components/pages/VehicleDetails';

/**
 * Helper Component: ProtectedRoute
 * Prevents non-authenticated users from accessing administrative routes.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated, keeping the attempted location in state
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Senior Tip: Scroll to Top on Route Change ---
// Without this, if you scroll to the footer on home and click 'Login', 
// the Login page will open already scrolled to the bottom.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AuthProvider> {/* 1. Wrap entire app in AuthProvider */}
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        
        {/* --- Auth Routes --- */}
        {/* Note: We no longer pass 'onViewChange' props. 
            The components will now use the useNavigate() hook internally. */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />  
        {/* --- Admin Dashboard (Nested) --- */}

        <Route path="/vehicle/:id" element={<VehicleDetail />} />  

        {/* --- Admin Dashboard (Protected) --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
          {/* index means this renders when the path is exactly '/admin' */}
          <Route index element={<Dashboard />} /> 
          <Route path="vehicles" element={<Vehicles />} /> 
          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />

        </Route>

        {/* --- 404 Redirect --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
