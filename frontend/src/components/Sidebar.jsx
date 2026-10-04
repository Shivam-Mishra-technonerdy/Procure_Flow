import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  FileSpreadsheet,
  BarChart3,
  Users,
  PlusCircle,
  CheckSquare,
  Package,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ onCloseMobile, isMobile = false }) => {
  const { user, logout, isAdmin, isBuyer, isSupplier, role } = useAuth();

  let navItems = [];

  if (isAdmin) {
    navItems = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/approval-queue', label: 'Approval Queue', icon: CheckSquare },
      { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ];
  } else if (isBuyer) {
    navItems = [
      { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/buyer/orders/create', label: 'Create Order', icon: PlusCircle },
      { to: '/buyer/orders', label: 'My Orders', icon: FileSpreadsheet },
    ];
  } else if (isSupplier) {
    navItems = [
      { to: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/supplier/orders', label: 'Assigned Orders', icon: Package },
    ];
  } else {
    // Fallback if role not set
    navItems = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];
  }

  const roleLabel = isAdmin ? 'Admin' : isBuyer ? 'Buyer' : isSupplier ? 'Supplier' : (role || 'User');
  const roleBadgeStyle = isAdmin
    ? 'bg-[#2563A6]/20 text-[#8BB9E8] border-[#2563A6]/40'
    : isSupplier
    ? 'bg-[#3F7D5A]/20 text-[#8ED0A8] border-[#3F7D5A]/40'
    : 'bg-[#2563A6]/20 text-[#8BB9E8] border-[#2563A6]/40';

  return (
    <aside className="w-full h-full bg-[#172B4D] text-[#BAC7D5] flex flex-col flex-shrink-0 select-none">
      {/* 1. Top Section: Logo & Branding */}
      <div className="p-4 sm:p-5 border-b border-[#213A63]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563A6] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
              P
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-tight">
                ProcureFlow
              </span>
              <span className="text-[11px] text-[#BAC7D5]/80 font-normal block">
                PO Management
              </span>
            </div>
          </div>

          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#BAC7D5] hover:text-white hover:bg-[#1E3863] transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Badge */}
        <div className="mt-3.5 pt-3 border-t border-[#213A63]/60 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#8893A7] uppercase tracking-wider">
            Workspace
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* 2. Navigation Items */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8893A7]">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-[#2563A6] text-white font-semibold shadow-xs'
                    : 'text-[#BAC7D5] hover:bg-[#1E3863] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* 3. User Profile Section at Bottom */}
      <div className="mt-auto border-t border-[#213A63] p-3 bg-[#11213D]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#172B4D] border border-[#213A63]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#2563A6] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[10px] text-[#BAC7D5]/70 truncate">
                {user?.email || roleLabel}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-[#BAC7D5] hover:text-[#B84C4C] hover:bg-[#213A63] rounded-md transition cursor-pointer flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[10px] text-[#8893A7] font-medium tracking-wide">
            ProcureFlow Enterprise v2.4
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;