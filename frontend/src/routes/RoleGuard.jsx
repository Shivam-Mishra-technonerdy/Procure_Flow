import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { normalizeRole, getRoleDashboard } from '../utils/formatters';

const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = normalizeRole(role || user?.role);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  const isAllowed = normalizedAllowed.length === 0 || normalizedAllowed.includes(currentRole);

  useEffect(() => {
    if (!isAllowed) {
      showToast('You do not have permission to access this page.', 'error');
    }
  }, [isAllowed, showToast]);

  if (!isAllowed) {
    const fallbackPath = getRoleDashboard(currentRole);
    return (
      <Navigate
        to={fallbackPath}
        replace
        state={{ accessDenied: 'You do not have permission to access this page.' }}
      />
    );
  }

  return <Outlet />;
};

export default RoleGuard;
