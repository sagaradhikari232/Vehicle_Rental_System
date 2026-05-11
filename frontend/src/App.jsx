import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage      from './components/pages/LandingPage';
import Login            from './components/sections/Login';
import Signup           from './components/sections/Signup';
import ForgotPassword   from './components/sections/ForgetPassword';
import PaymentSuccess   from './components/pages/Paymentsuccess';
import PaymentFailed    from './components/pages/Paymentfailed';

// Vehicle
import VehicleDetail    from './components/pages/VehicleDetails';

// Account page — NEW
import AccountPage      from './components/pages/AccountPage';

// Admin
import DashboardLayout  from './components/admin/DashboardLayout';
import Dashboard        from './components/pages/admin/Dashboard';
import Vehicles         from './components/pages/admin/Vehicles';
import Bookings         from './components/pages/admin/Bookings';
import Users            from './components/pages/admin/Users';
import Payments         from './components/pages/admin/Payments';

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ─── ScrollToTop ───────────────────────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/signup"            element={<Signup />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/payment/success"   element={<PaymentSuccess />} />
          <Route path="/payment/failed"    element={<PaymentFailed />} />
          <Route path="/vehicle/:id"       element={<VehicleDetail />} />

          {/* Account — protected */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Admin — protected + nested */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index           element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />}  />
            <Route path="bookings" element={<Bookings />}  />
            <Route path="users"    element={<Users />}     />
            <Route path="payments" element={<Payments />}  />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}