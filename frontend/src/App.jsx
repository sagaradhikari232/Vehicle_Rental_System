import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Public Pages
import LandingPage from './components/pages/LandingPage'; 
import Login from './components/sections/Login';
import Signup from './components/sections/Signup';
import ForgotPassword from './components/sections/ForgetPassword';

// Admin Components
import DashboardLayout from './components/admin/DashboardLayout';
import Dashboard from './components/pages/admin/Dashboard';
import Vehicles from './components/pages/admin/Vehicles';
import Bookings from './components/pages/admin/Bookings';
import Users from './components/pages/admin/Users';


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

        {/* --- Admin Dashboard (Nested) --- */}
        <Route path="/admin" element={<DashboardLayout />}>
          {/* index means this renders when the path is exactly '/admin' */}
          <Route index element={<Dashboard />} /> 
          <Route path="vehicles" element={<Vehicles />} /> 
          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* --- 404 Redirect --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}