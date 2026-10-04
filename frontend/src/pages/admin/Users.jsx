import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Trash2,
  Mail,
  Shield,
  Building2,
  Calendar,
  X,
  Loader2,
  Edit2,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Globe,
  MapPin,
  Phone,
} from 'lucide-react';
import { userApi, supplierApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, ISO_COUNTRIES, PHONE_COUNTRY_CODES } from '../../utils/formatters';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Add User Form Data
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER',
    active: true,
    supplierId: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    countryCode: 'IN',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });

  // Edit User Form Data
  const [editForm, setEditForm] = useState({
    id: null,
    fullName: '',
    email: '',
    role: 'BUYER',
    active: true,
    supplierId: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    countryCode: 'IN',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });

  // Reset Password Form Data
  const [resetForm, setResetForm] = useState({
    userId: null,
    userName: '',
    userEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Submitting loaders
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  const fetchUsersAndSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, suppliersRes] = await Promise.all([
        userApi.getAll().catch(() => ({ data: [] })),
        supplierApi.getAll().catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndSuppliers();
  }, []);

  // --- ADD USER ---
  const openAddModal = () => {
    setAddForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'BUYER',
      active: true,
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
      phoneCountryCode: '+91',
      phoneNumber: '',
      countryCode: 'IN',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validations
    if (!addForm.fullName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addForm.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (addForm.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (addForm.role === 'SUPPLIER' && !addForm.supplierId) {
      showToast('Please select an associated supplier for the Supplier role.', 'error');
      return;
    }

    try {
      setSubmittingAdd(true);
      const payload = {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        role: addForm.role,
        active: addForm.active,
        supplierId: addForm.role === 'SUPPLIER' && addForm.supplierId ? parseInt(addForm.supplierId) : null,
        phoneCountryCode: addForm.phoneCountryCode || '+91',
        phoneNumber: addForm.phoneNumber ? addForm.phoneNumber.trim() : null,
        countryCode: addForm.countryCode || 'IN',
        addressLine1: addForm.addressLine1 ? addForm.addressLine1.trim() : null,
        addressLine2: addForm.addressLine2 ? addForm.addressLine2.trim() : null,
        city: addForm.city ? addForm.city.trim() : null,
        stateProvince: addForm.stateProvince ? addForm.stateProvince.trim() : null,
        postalCode: addForm.postalCode ? addForm.postalCode.trim() : null,
      };

      await userApi.create(payload);
      showToast('User account created successfully!');
      setIsAddModalOpen(false);
      fetchUsersAndSuppliers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create user account.', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // --- EDIT USER ---
  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      fullName: user.fullName || '',
      email: user.email || '',
      role: cleanRole(user.role),
      active: user.active !== false,
      supplierId: user.supplierId ? String(user.supplierId) : (suppliers[0]?.id ? String(suppliers[0].id) : ''),
      phoneCountryCode: user.phoneCountryCode || '+91',
      phoneNumber: user.phoneNumber || '',
      countryCode: user.countryCode || 'IN',
      addressLine1: user.addressLine1 || '',
      addressLine2: user.addressLine2 || '',
      city: user.city || '',
      stateProvince: user.stateProvince || '',
      postalCode: user.postalCode || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editForm.fullName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (editForm.role === 'SUPPLIER' && !editForm.supplierId) {
      showToast('Please select an associated supplier for the Supplier role.', 'error');
      return;
    }

    try {
      setSubmittingEdit(true);
      const payload = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        active: editForm.active,
        supplierId: editForm.role === 'SUPPLIER' && editForm.supplierId ? parseInt(editForm.supplierId) : null,
        phoneCountryCode: editForm.phoneCountryCode || '+91',
        phoneNumber: editForm.phoneNumber ? editForm.phoneNumber.trim() : null,
        countryCode: editForm.countryCode || 'IN',
        addressLine1: editForm.addressLine1 ? editForm.addressLine1.trim() : null,
        addressLine2: editForm.addressLine2 ? editForm.addressLine2.trim() : null,
        city: editForm.city ? editForm.city.trim() : null,
        stateProvince: editForm.stateProvince ? editForm.stateProvince.trim() : null,
        postalCode: editForm.postalCode ? editForm.postalCode.trim() : null,
      };

      await userApi.update(editForm.id, payload);
      showToast('User details updated successfully!');
      setIsEditModalOpen(false);
      fetchUsersAndSuppliers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update user details.', 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // --- RESET PASSWORD ---
  const openResetModal = (user) => {
    setResetForm({
      userId: user.id,
      userName: user.fullName || user.email,
      userEmail: user.email,
      newPassword: '',
      confirmPassword: '',
    });
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setSubmittingReset(true);
      await userApi.resetPassword(resetForm.userId, resetForm.newPassword);
      showToast(`Password for ${resetForm.userEmail} has been reset successfully!`);
      setIsResetModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to reset user password.', 'error');
    } finally {
      setSubmittingReset(false);
    }
  };

  // --- STATUS TOGGLE ---
  const handleToggleStatus = async (user) => {
    const isCurrent = currentUser?.id === user.id || currentUser?.email === user.email;
    if (isCurrent && user.active) {
      showToast('You cannot deactivate your own active account.', 'error');
      return;
    }

    try {
      setTogglingStatusId(user.id);
      const newStatus = !user.active;
      await userApi.updateStatus(user.id, newStatus);
      showToast(`User ${user.email} is now ${newStatus ? 'Active' : 'Inactive'}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u))
      );
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update user status.', 'error');
    } finally {
      setTogglingStatusId(null);
    }
  };

  // --- SAFE DELETE ---
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (currentUser?.id === userToDelete.id || currentUser?.email === userToDelete.email) {
      showToast('You cannot delete your own account.', 'error');
      setUserToDelete(null);
      return;
    }

    try {
      setDeleting(true);
      await userApi.delete(userToDelete.id);
      showToast(`User account "${userToDelete.email}" deleted successfully.`);
      setUserToDelete(null);
      fetchUsersAndSuppliers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete user account.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const cleanRole = (role) => {
    if (!role) return 'BUYER';
    return role.replace(/^ROLE_/, '');
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const roleName = cleanRole(u.role);
    const roleMatch = roleFilter === 'ALL' || roleName === roleFilter;

    const isActive = u.active !== false;
    const statusMatch =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isActive) ||
      (statusFilter === 'INACTIVE' && !isActive);

    const search = searchTerm.toLowerCase();
    const searchMatch =
      !searchTerm ||
      (u.fullName && u.fullName.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.username && u.username.toLowerCase().includes(search));

    return roleMatch && statusMatch && searchMatch;
  });

  if (loading) {
    return <LoadingState message="Loading system user accounts..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchUsersAndSuppliers} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight">User Management</h1>
          <p className="text-sm text-[#667085] mt-1">
            Administer system roles, login credentials, account statuses, and supplier assignments
          </p>
        </div>

        {/* Visible + Add New User button */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E5E9] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] placeholder:text-[#667085]/60 transition"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#667085] flex items-center gap-1 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Role:
          </span>
          {['ALL', 'ADMIN', 'BUYER', 'SUPPLIER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === r
                  ? 'bg-[#172B4D] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#667085] hover:bg-[#E2E5E9]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 border-t lg:border-t-0 pt-2 lg:pt-0">
          <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">Status:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                statusFilter === s
                  ? s === 'ACTIVE'
                    ? 'bg-[#3F7D5A] text-white shadow-xs'
                    : s === 'INACTIVE'
                    ? 'bg-[#B84C4C] text-white shadow-xs'
                    : 'bg-[#172B4D] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#667085] hover:bg-[#E2E5E9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E2E5E9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Country & Phone</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Associated Supplier</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-[#667085]">
                    No users found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleName = cleanRole(u.role);
                  const isActive = u.active !== false;
                  const isCurrent = currentUser?.id === u.id || currentUser?.email === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center flex-shrink-0 text-xs ${
                            roleName === 'ADMIN'
                              ? 'bg-[#172B4D]/10 text-[#172B4D]'
                              : roleName === 'SUPPLIER'
                              ? 'bg-[#EDF5F0] text-[#3F7D5A]'
                              : 'bg-[#EAF2FA] text-[#2563A6]'
                          }`}>
                            {u.fullName?.charAt(0) || u.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-[#263238]">{u.fullName || u.email.split('@')[0]}</p>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F7F5F0] text-[#667085] border border-[#E2E5E9]">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#667085]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-1.5 text-[#667085]">
                          <Mail className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
                          <span className="font-mono text-[11px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            roleName === 'ADMIN'
                              ? 'bg-[#172B4D]/10 text-[#172B4D] border-[#172B4D]/20'
                              : roleName === 'SUPPLIER'
                              ? 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9]'
                              : 'bg-[#EAF2FA] text-[#2563A6] border-[#D0E2F5]'
                          }`}
                        >
                          {roleName}
                        </span>
                      </td>

                      {/* Country & Phone */}
                      <td className="px-5 py-3.5">
                        {u.countryCode || u.phoneNumber ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-medium text-[#263238]">
                              <span>{ISO_COUNTRIES.find((c) => c.code === u.countryCode)?.flag || '🌐'}</span>
                              <span>{ISO_COUNTRIES.find((c) => c.code === u.countryCode)?.name || u.countryCode || 'Global'}</span>
                            </div>
                            {(u.phoneCountryCode || u.phoneNumber) && (
                              <p className="text-[11px] text-[#667085] font-mono">
                                {u.phoneCountryCode ? `${u.phoneCountryCode} ` : ''}{u.phoneNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#667085]">—</span>
                        )}
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingStatusId === u.id || (isCurrent && isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer disabled:cursor-not-allowed ${
                            isActive
                              ? 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9] hover:bg-[#D1E7D9]/50'
                              : 'bg-[#FDF2F2] text-[#B84C4C] border-[#F8D7DA] hover:bg-[#F8D7DA]/50'
                          }`}
                          title={isCurrent && isActive ? 'Cannot deactivate your own account' : 'Click to toggle status'}
                        >
                          {togglingStatusId === u.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isActive ? (
                            <CheckCircle2 className="w-3 h-3 text-[#3F7D5A]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#B84C4C]" />
                          )}
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Supplier Organization */}
                      <td className="px-5 py-3.5">
                        {u.supplierName || (u.supplier && (u.supplier.companyName || u.supplier.name)) ? (
                          <div className="flex items-center space-x-1 text-[#3F7D5A] font-medium">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{u.supplierName || u.supplier?.companyName || u.supplier?.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#667085]">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-3.5 text-[#667085]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Edit User */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-[#667085] hover:text-[#2563A6] hover:bg-[#EAF2FA] rounded-lg transition cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => openResetModal(u)}
                            className="p-1.5 text-[#667085] hover:text-[#B9852C] hover:bg-[#FCF7ED] rounded-lg transition cursor-pointer"
                            title="Reset User Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition ${
                              isCurrent
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-[#667085] hover:text-[#B84C4C] hover:bg-[#FDF2F2] cursor-pointer'
                            }`}
                            title={isCurrent ? 'You cannot delete your own account' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD USER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-[#E2E5E9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FA] text-[#2563A6] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">Add New User</h3>
                  <p className="text-[11px] text-[#667085]">Create login credentials, assign role, and set profile details</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              {/* Account Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Full Name <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    placeholder="e.g. Alice Walker"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Email Address <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="alice@example.com"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Password <span className="text-[#B84C4C]">*</span> <span className="text-[10px] text-[#667085]">(min 8)</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Confirm Password <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full text-xs p-2.5 bg-[#F7F5F0] border rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition ${
                      addForm.confirmPassword && addForm.password !== addForm.confirmPassword
                        ? 'border-[#B84C4C] focus:ring-[#B84C4C]'
                        : 'border-[#E2E5E9]'
                    }`}
                  />
                  {addForm.confirmPassword && addForm.password !== addForm.confirmPassword && (
                    <p className="text-[10px] text-[#B84C4C] mt-1">Passwords do not match.</p>
                  )}
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    User Role <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="BUYER">BUYER (Create & track purchase orders)</option>
                    <option value="ADMIN">ADMIN (Full management rights)</option>
                    <option value="SUPPLIER">SUPPLIER (View assigned POs & fulfill)</option>
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Account Status <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    value={addForm.active ? 'true' : 'false'}
                    onChange={(e) => setAddForm({ ...addForm, active: e.target.value === 'true' })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="true">Active (Can log in)</option>
                    <option value="false">Inactive (Login disabled)</option>
                  </select>
                </div>
              </div>

              {/* Supplier Dropdown (Only when role is SUPPLIER) */}
              {addForm.role === 'SUPPLIER' && (
                <div className="p-3 bg-[#EDF5F0] border border-[#D1E7D9] rounded-lg space-y-2">
                  <label className="block text-xs font-semibold text-[#2F6144]">
                    Linked Supplier Company <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    required
                    value={addForm.supplierId}
                    onChange={(e) => setAddForm({ ...addForm, supplierId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#D1E7D9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#3F7D5A] transition"
                  >
                    <option value="">Select a supplier company...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName || s.name} ({s.contactEmail || s.email || 'Supplier'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#3F7D5A]">
                    This user will only have access to purchase orders assigned to this supplier.
                  </p>
                </div>
              )}

              {/* International Contact & Location Section */}
              <div className="pt-2 border-t border-[#E2E5E9]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563A6]" />
                  <span className="text-xs font-bold text-[#263238]">International Contact & Location</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Country */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Country (ISO)
                    </label>
                    <select
                      value={addForm.countryCode}
                      onChange={(e) => {
                        const match = ISO_COUNTRIES.find((x) => x.code === e.target.value);
                        setAddForm({
                          ...addForm,
                          countryCode: e.target.value,
                          phoneCountryCode: match ? match.phoneCode : addForm.phoneCountryCode,
                        });
                      }}
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    >
                      {ISO_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={addForm.phoneCountryCode}
                        onChange={(e) => setAddForm({ ...addForm, phoneCountryCode: e.target.value })}
                        className="w-28 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                      >
                        {PHONE_COUNTRY_CODES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={addForm.phoneNumber}
                        onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="flex-1 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-2 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={addForm.addressLine1}
                      onChange={(e) => setAddForm({ ...addForm, addressLine1: e.target.value })}
                      placeholder="Street address, building, suite"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Address Line 2 <span className="text-[#667085] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.addressLine2}
                      onChange={(e) => setAddForm({ ...addForm, addressLine2: e.target.value })}
                      placeholder="Apartment, unit, floor, etc."
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                </div>

                {/* City, State/Province, Postal Code */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={addForm.city}
                      onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={addForm.stateProvince}
                      onChange={(e) => setAddForm({ ...addForm, stateProvince: e.target.value })}
                      placeholder="State / Region"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={addForm.postalCode}
                      onChange={(e) => setAddForm({ ...addForm, postalCode: e.target.value })}
                      placeholder="Postal code"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-2 text-xs font-semibold bg-[#2563A6] hover:bg-[#1E528B] text-white rounded-lg shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-[#E2E5E9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FA] text-[#2563A6] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">Edit User Details</h3>
                  <p className="text-[11px] text-[#667085]">Update account profile, role, and supplier linkage</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              {/* Account Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Full Name <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="e.g. Alice Walker"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Email Address <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="alice@example.com"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    User Role <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="BUYER">BUYER (Create and track purchase orders)</option>
                    <option value="ADMIN">ADMIN (Full administrative rights)</option>
                    <option value="SUPPLIER">SUPPLIER (View assigned POs and mark delivered)</option>
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Account Status <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    value={editForm.active ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Supplier Dropdown (Only when role is SUPPLIER) */}
              {editForm.role === 'SUPPLIER' && (
                <div className="p-3 bg-[#EDF5F0] border border-[#D1E7D9] rounded-lg space-y-2">
                  <label className="block text-xs font-semibold text-[#2F6144]">
                    Linked Supplier Company <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    required
                    value={editForm.supplierId}
                    onChange={(e) => setEditForm({ ...editForm, supplierId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#D1E7D9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#3F7D5A] transition"
                  >
                    <option value="">Select a supplier company...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName || s.name} ({s.contactEmail || s.email || 'Supplier'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* International Contact & Location Section */}
              <div className="pt-2 border-t border-[#E2E5E9]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563A6]" />
                  <span className="text-xs font-bold text-[#263238]">International Contact & Location</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Country */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Country (ISO)
                    </label>
                    <select
                      value={editForm.countryCode}
                      onChange={(e) => {
                        const match = ISO_COUNTRIES.find((x) => x.code === e.target.value);
                        setEditForm({
                          ...editForm,
                          countryCode: e.target.value,
                          phoneCountryCode: match ? match.phoneCode : editForm.phoneCountryCode,
                        });
                      }}
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    >
                      {ISO_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={editForm.phoneCountryCode}
                        onChange={(e) => setEditForm({ ...editForm, phoneCountryCode: e.target.value })}
                        className="w-28 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                      >
                        {PHONE_COUNTRY_CODES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="flex-1 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-2 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={editForm.addressLine1}
                      onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                      placeholder="Street address, building, suite"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Address Line 2 <span className="text-[#667085] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.addressLine2}
                      onChange={(e) => setEditForm({ ...editForm, addressLine2: e.target.value })}
                      placeholder="Apartment, unit, floor, etc."
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                </div>

                {/* City, State/Province, Postal Code */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={editForm.stateProvince}
                      onChange={(e) => setEditForm({ ...editForm, stateProvince: e.target.value })}
                      placeholder="State / Region"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={editForm.postalCode}
                      onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                      placeholder="Postal code"
                      className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-2 text-xs font-semibold bg-[#2563A6] hover:bg-[#1E528B] text-white rounded-lg shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-[#E2E5E9]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FCF7ED] text-[#B9852C] flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">Reset Password</h3>
                  <p className="text-[11px] text-[#667085]">Set a new login password</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg">
              <p className="text-[11px] font-semibold text-[#263238]">{resetForm.userName}</p>
              <p className="text-[10px] text-[#667085] font-mono">{resetForm.userEmail}</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  New Password <span className="text-[#B84C4C]">*</span> <span className="text-[11px] text-[#667085] font-normal">(min 8 chars)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  Confirm New Password <span className="text-[#B84C4C]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full text-xs p-2.5 bg-[#F7F5F0] border rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition ${
                    resetForm.confirmPassword && resetForm.newPassword !== resetForm.confirmPassword
                      ? 'border-[#B84C4C] focus:ring-[#B84C4C]'
                      : 'border-[#E2E5E9]'
                  }`}
                />
                {resetForm.confirmPassword && resetForm.newPassword !== resetForm.confirmPassword && (
                  <p className="text-[10px] text-[#B84C4C] mt-1">Passwords do not match.</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReset}
                  className="px-4 py-2 text-xs font-semibold bg-[#B9852C] hover:bg-[#8F651C] text-white rounded-lg shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReset && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM DIALOG --- */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${userToDelete?.fullName || userToDelete?.email}"? This action cannot be undone.`}
        type="danger"
        confirmText="Yes, Delete User"
        loading={deleting}
        onConfirm={handleDeleteUser}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};

export default Users;
