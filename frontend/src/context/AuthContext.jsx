import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { authApi } from '../api';
import { normalizeRole, getRoleDashboard } from '../utils/formatters';

const AuthContext = createContext(null);

// Safely decodes claims directly from the cryptographically signed backend JWT
const parseJwt = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Authenticated user's role must originate strictly from the signed JWT claim or backend login response
  const jwtClaims = token ? parseJwt(token) : null;
  const role = jwtClaims?.role
    ? normalizeRole(jwtClaims.role)
    : (user?.role ? normalizeRole(user.role) : null);

  useEffect(() => {
    // If token is expired, log out immediately
    if (jwtClaims?.exp && Date.now() >= jwtClaims.exp * 1000) {
      logout();
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      const data = res.data;
      const authToken = data.token;
      const parsedClaims = parseJwt(authToken);
      const assignedRole = normalizeRole(parsedClaims?.role || data.role);

      const userData = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: assignedRole,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
      };

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      const redirectUrl = getRoleDashboard(assignedRole);
      return { user: userData, token: authToken, redirectUrl };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.token) {
        const authToken = res.data.token;
        const parsedClaims = parseJwt(authToken);
        const assignedRole = normalizeRole(parsedClaims?.role || res.data.role);

        const uData = {
          id: res.data.id,
          email: res.data.email,
          fullName: res.data.fullName,
          role: assignedRole,
          supplierId: res.data.supplierId,
          supplierName: res.data.supplierName,
        };
        setToken(authToken);
        setUser(uData);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(uData));
        const redirectUrl = getRoleDashboard(assignedRole);
        return { user: uData, token: authToken, redirectUrl };
      } else {
        return await login({ email: userData.email, password: userData.password });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: role === 'ADMIN',
        isBuyer: role === 'BUYER',
        isSupplier: role === 'SUPPLIER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};