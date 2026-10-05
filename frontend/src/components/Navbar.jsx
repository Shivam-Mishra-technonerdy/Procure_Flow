import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  ChevronDown,
  ExternalLink,
  Menu,
} from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isSupplier } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="bg-[#172B4D]/10 text-[#172B4D] text-[11px] px-2.5 py-0.5 rounded font-semibold border border-[#172B4D]/20 uppercase tracking-wider">
          Admin
        </span>
      );
    }
    if (isSupplier) {
      return (
        <span className="bg-[#EDF5F0] text-[#3F7D5A] text-[11px] px-2.5 py-0.5 rounded font-semibold border border-[#C2E2CE] uppercase tracking-wider">
          Supplier
        </span>
      );
    }
    return (
      <span className="bg-[#EAF2FA] text-[#2563A6] text-[11px] px-2.5 py-0.5 rounded font-semibold border border-[#B8D2EE] uppercase tracking-wider">
        Buyer
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-[#E2E5E9] sticky top-0 z-20 h-16 flex items-center shadow-xs">
      <div className="w-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Active Role */}
        <div className="flex items-center space-x-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-[#667085] hover:bg-[#F8F9FA] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-[#172B4D] text-white rounded-lg flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              P
            </div>
            <div className="flex items-center">
              <span className="text-base font-bold text-[#263238] tracking-tight">
                ProcureFlow
              </span>
              <span className="hidden sm:inline-block text-xs text-[#667085] font-normal ml-2.5 border-l border-[#E2E5E9] pl-2.5">
                PO Management
              </span>
            </div>
          </div>
          {getRoleBadge()}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Swagger API Link */}
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#263238] hover:text-[#172B4D] bg-[#F8F9FA] hover:bg-[#ECEEF1] border border-[#E2E5E9] transition"
            title="Open Swagger OpenAPI Documentation"
          >
            <span>Swagger</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#667085]" />
          </a>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-[#F8F9FA] transition cursor-pointer border border-transparent hover:border-[#E2E5E9]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#172B4D] text-white font-semibold text-xs flex items-center justify-center">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#263238] leading-tight truncate max-w-[130px]">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-[#667085] truncate max-w-[130px]">{user?.email}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#667085] transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-[#E2E5E9] py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2.5 border-b border-[#E2E5E9]">
                  <p className="text-xs font-bold text-[#263238] truncate">{user?.fullName || 'User'}</p>
                  <p className="text-[11px] text-[#667085] truncate">{user?.email}</p>
                  {user?.supplierName && (
                    <p className="text-[10px] text-[#3F7D5A] font-semibold mt-1 truncate">
                      Vendor: {user.supplierName}
                    </p>
                  )}
                </div>
                <div className="p-1">
                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 text-left text-xs text-[#B84C4C] hover:bg-[#FDF2F2] rounded-lg flex items-center space-x-2 transition font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;