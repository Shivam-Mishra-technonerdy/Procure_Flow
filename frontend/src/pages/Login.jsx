import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthApi } from '../api';
import { Lock, User, RefreshCw } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const checkBackendHealth = async () => {
    try {
      const res = await healthApi.check();
      if (res.data?.status === 'UP') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (e) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const getErrorMessage = (err) => {
    if (!err.response) {
      return 'Backend is offline. Run start-project.bat, then refresh this page.';
    }
    if (err.response.status === 401 || err.response.status === 400) {
      return 'Invalid email or password.';
    }
    return err.response?.data?.message || 'Invalid email or password.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res?.redirectUrl) {
        navigate(res.redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#172B4D] text-white mb-2.5 font-bold text-lg shadow-xs">
            P
          </div>
          <h1 className="text-xl font-bold text-[#263238] tracking-tight">ProcureFlow</h1>
          <p className="text-xs text-[#667085] mt-0.5">Enterprise Procurement & Purchase Order System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E5E9] shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[#E2E5E9]">
            <div>
              <h2 className="text-base font-bold text-[#263238]">Sign In to Your Account</h2>
              <p className="text-xs text-[#667085] mt-0.5">Enter your credentials to access your portal</p>
            </div>

            {/* Backend-Status Indicator */}
            <div className="flex-shrink-0">
              {backendStatus === 'online' ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9]"
                  title="Spring Boot backend is active and reachable"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D5A]"></span>
                  <span>Backend Online</span>
                </div>
              ) : backendStatus === 'offline' ? (
                <button
                  type="button"
                  onClick={checkBackendHealth}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDF2F2] text-[#B84C4C] border border-[#F8D7DA] hover:bg-[#FDF2F2]/80 transition cursor-pointer"
                  title="Backend is offline. Click to recheck or run start-project.bat"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B84C4C]"></span>
                  <span>Backend Offline</span>
                  <RefreshCw className="w-3 h-3 ml-0.5 text-[#B84C4C]" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8F9FA] text-[#667085] border border-[#E2E5E9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#667085] animate-ping"></span>
                  <span>Checking...</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#F8D7DA] text-[#B84C4C] text-xs rounded-lg font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Email / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition placeholder:text-[#667085]/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2563A6] hover:bg-[#1E528B] text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#667085]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2563A6] hover:text-[#1E528B] font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;