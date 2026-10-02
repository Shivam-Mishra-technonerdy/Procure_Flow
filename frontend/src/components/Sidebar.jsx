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
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isBuyer, isSupplier, role } = useAuth();

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

  return (
    <aside className="w-64 bg-[#172B4D] text-[#BAC7D5] flex flex-col flex-shrink-0 min-h-[calc(100vh-57px)] p-4 border-r border-[#0F1D33]">
      <div className="flex items-center justify-between px-3 py-1.5 mb-3 border-b border-[#213A63] pb-2.5">
        <span className="text-[10px] font-bold text-[#8893A7] uppercase tracking-wider">
          {isAdmin ? 'Admin Workspace' : isBuyer ? 'Buyer Workspace' : isSupplier ? 'Supplier Workspace' : 'Navigation'}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-[#1E3863] text-[#EAF2FA] border border-[#2B4E85]">
          {role || 'User'}
        </span>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
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

      <div className="pt-3 border-t border-[#213A63] px-2">
        <p className="text-[10px] text-[#8893A7] font-medium">ProcureFlow Enterprise v2.4</p>
      </div>
    </aside>
  );
};

export default Sidebar;