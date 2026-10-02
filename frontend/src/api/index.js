import api from './axios';

// Authentication API
export const authApi = {
  login: async (credentials) => {
    // Backend supports both usernameOrEmail and email/password
    const payload = {
      usernameOrEmail: credentials.email || credentials.usernameOrEmail,
      email: credentials.email || credentials.usernameOrEmail,
      password: credentials.password,
    };
    return api.post('/auth/login', payload);
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Suppliers API (Admin CRUD, Buyer/Supplier list)
export const supplierApi = {
  getAll: (search) => api.get('/suppliers', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Users API (Admin User Management)
export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, active) => api.patch(`/users/${id}/status`, { active }),
  resetPassword: (id, password) => api.patch(`/users/${id}/reset-password`, { password }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Purchase Orders API (Workflow & Actions)
export const orderApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => {
    // Maps remarks or rejectionReason for backend compatibility
    const payload = {
      status: data.status,
      remarks: data.remarks || data.rejectionReason,
      rejectionReason: data.remarks || data.rejectionReason,
      actualDeliveryDate: data.actualDeliveryDate,
    };
    return api.patch(`/orders/${id}/status`, payload);
  },
  downloadPdf: (id) => api.get(`/orders/${id}/pdf`, { responseType: 'blob' }),
};

// Reports API (Admin & Role Analytics)
export const reportApi = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getOrderReports: () => api.get('/reports/dashboard'),
};

// Health API (System Status Probe)
export const healthApi = {
  check: () => api.get('/health'),
};