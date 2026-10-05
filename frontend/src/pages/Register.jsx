import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { supplierApi } from '../api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    supplierId: '',
    password: '',
    confirmPassword: '',
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const res = await supplierApi.getAll();
        const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setSuppliers(list);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        supplierId: value === 'SUPPLIER' ? prev.supplierId : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.role) {
      setError('Please select an account role.');
      return;
    }

    if (formData.role === 'SUPPLIER' && !formData.supplierId) {
      setError('Please select a supplier company.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        supplierId: formData.role === 'SUPPLIER' ? Number(formData.supplierId) : null,
      };

      const res = await register(payload);
      if (res?.redirectUrl) {
        navigate(res.redirectUrl);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#172B4D] text-white mb-2 font-bold text-lg shadow-xs">
            P
          </div>
          <h1 className="text-xl font-bold text-[#263238] tracking-tight">ProcureFlow</h1>
          <p className="text-xs text-[#667085] mt-0.5">Enterprise Procurement & Purchase Order System</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E5E9] shadow-xs">
          <Link to="/login" className="inline-flex items-center text-xs text-[#2563A6] hover:text-[#1E528B] font-semibold mb-3 gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>

          <h2 className="text-base font-bold text-[#263238] mb-0.5">Create an Account</h2>
          <p className="text-xs text-[#667085] mb-4">Register as an Admin, Buyer, or Supplier</p>

          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#F8D7DA] text-[#B84C4C] text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Sarah Connor"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="sconnor"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Select Account Role</label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
              >
                <option value="">Select Account Role</option>
                <option value="ADMIN">Admin</option>
                <option value="BUYER">Buyer</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>

            {formData.role === 'SUPPLIER' && (
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">Supplier Company</label>
                <select
                  name="supplierId"
                  required
                  value={formData.supplierId}
                  onChange={handleChange}
                  disabled={loadingSuppliers}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                >
                  <option value="">
                    {loadingSuppliers ? 'Loading suppliers...' : 'Select Supplier Company'}
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-[#2563A6] hover:bg-[#1E528B] text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-[#667085]">Already have an account? </span>
            <Link to="/login" className="text-xs font-semibold text-[#2563A6] hover:text-[#1E528B]">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;