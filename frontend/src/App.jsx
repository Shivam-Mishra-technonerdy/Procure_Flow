import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { normalizeRole, getRoleDashboard } from './utils/formatters';

import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Suppliers from './pages/admin/Suppliers';
import Users from './pages/admin/Users';
import ApprovalQueue from './pages/admin/ApprovalQueue';
import Reports from './pages/admin/Reports';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import CreateOrder from './pages/buyer/CreateOrder';
import MyOrders from './pages/buyer/MyOrders';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import AssignedOrders from './pages/supplier/AssignedOrders';

// Role-based Redirector Components
const RoleHomeRedirect = () => {
  const { user, isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboard(role || user?.role)} replace />;
};

const OrdersRedirect = () => {
  const { role } = useAuth();
  const norm = normalizeRole(role);
  if (norm === 'ADMIN') return <Navigate to="/admin/approval-queue" replace />;
  if (norm === 'SUPPLIER') return <Navigate to="/supplier/orders" replace />;
  return <Navigate to="/buyer/orders" replace />;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes inside DashboardLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Root / Legacy shortcuts */}
                <Route path="/" element={<RoleHomeRedirect />} />
                <Route path="/dashboard" element={<RoleHomeRedirect />} />
                <Route path="/orders" element={<OrdersRedirect />} />
                <Route path="/orders/create" element={<Navigate to="/buyer/orders/create" replace />} />
                <Route path="/suppliers" element={<Navigate to="/admin/suppliers" replace />} />
                <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />

                {/* ADMIN ROUTES (ROLE_ADMIN only) */}
                <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/approval-queue" element={<ApprovalQueue />} />
                  <Route path="/admin/suppliers" element={<Suppliers />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/reports" element={<Reports />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* BUYER ROUTES (ROLE_BUYER only) */}
                <Route element={<RoleGuard allowedRoles={['BUYER']} />}>
                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                  <Route path="/buyer/orders" element={<MyOrders />} />
                  <Route path="/buyer/orders/create" element={<CreateOrder />} />
                  <Route path="/buyer/*" element={<Navigate to="/buyer/dashboard" replace />} />
                </Route>

                {/* SUPPLIER ROUTES (ROLE_SUPPLIER only) */}
                <Route element={<RoleGuard allowedRoles={['SUPPLIER']} />}>
                  <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                  <Route path="/supplier/orders" element={<AssignedOrders />} />
                  <Route path="/supplier/*" element={<Navigate to="/supplier/dashboard" replace />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RoleHomeRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;