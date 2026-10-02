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
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#263238]">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#172B4D]/60 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-[#172B4D]"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {permissionError && (
            <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C4C4] rounded-lg flex items-center justify-between text-[#933737] shadow-xs">
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
