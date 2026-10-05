import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { AlertCircle, X } from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    if (location.state?.accessDenied) {
      setPermissionError(
        typeof location.state.accessDenied === 'string'
          ? location.state.accessDenied
          : 'You do not have permission to access this page.'
      );
      // Clean history state so refresh doesn't retain the alert indefinitely
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex bg-white text-[#263238] font-sans antialiased">
      {/* 1. Desktop Full-Height Dark Left Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#172B4D] border-r border-[#0F1D33] h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar onCloseMobile={() => {}} />
      </div>

      {/* 2. Main Workspace Layout (Top Header + Content Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Clean White Top Header */}
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Mobile Slide-Out Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#172B4D]/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 h-full bg-[#172B4D] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} isMobile={true} />
            </div>
          </div>
        )}

        {/* Spacious Main Content Area */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto animate-fade-in">
          {permissionError && (
            <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C4C4] rounded-xl flex items-center justify-between text-[#933737] shadow-xs">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-[#B84C4C] flex-shrink-0" />
                <span className="text-xs font-semibold">{permissionError}</span>
              </div>
              <button
                onClick={() => setPermissionError(null)}
                className="p-1 hover:bg-[#FBE4E4] rounded-md text-[#933737] transition cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
