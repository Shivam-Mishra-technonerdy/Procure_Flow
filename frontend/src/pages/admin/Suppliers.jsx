import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  Globe,
} from 'lucide-react';
import { supplierApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { ISO_COUNTRIES, PHONE_COUNTRY_CODES, getCountryName, getCountryFlag } from '../../utils/formatters';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';

const Suppliers = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    category: 'Hardware',
    rating: 4.5,
    active: true,
    phoneCountryCode: '+91',
    phoneNumber: '',
    countryCode: 'IN',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm State
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supplierApi.getAll();
      setSuppliers(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      category: 'Electronics',
      rating: 4.5,
      active: true,
      phoneCountryCode: '+91',
      phoneNumber: '',
      countryCode: 'IN',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      companyName: supplier.companyName || supplier.name || '',
      email: supplier.contactEmail || supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      category: supplier.category || 'Hardware',
      rating: supplier.rating ?? 4.5,
      active: supplier.active ?? true,
      phoneCountryCode: supplier.phoneCountryCode || '+91',
      phoneNumber: supplier.phoneNumber || '',
      countryCode: supplier.countryCode || 'IN',
      addressLine1: supplier.addressLine1 || '',
      addressLine2: supplier.addressLine2 || '',
      city: supplier.city || '',
      stateProvince: supplier.stateProvince || '',
      postalCode: supplier.postalCode || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        contactEmail: formData.email,
        phone: formData.phoneNumber ? `${formData.phoneCountryCode} ${formData.phoneNumber}` : formData.phone,
        address: formData.addressLine1 ? [formData.addressLine1, formData.addressLine2, formData.city, formData.stateProvince, formData.postalCode].filter(Boolean).join(', ') : formData.address,
      };

      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, payload);
        showToast('Supplier updated successfully!');
      } else {
        await supplierApi.create(payload);
        showToast('Supplier added successfully!');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving supplier.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      setDeleting(true);
      await supplierApi.delete(supplierToDelete.id);
      showToast('Supplier deleted successfully.');
      setSupplierToDelete(null);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete supplier.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filter logic
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.companyName && s.companyName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.countryCode && s.countryCode.toLowerCase().includes(q)) ||
      (getCountryName(s.countryCode) && getCountryName(s.countryCode).toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'ALL' || s.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(suppliers.map((s) => s.category).filter(Boolean))];

  if (loading) {
    return <LoadingState message="Loading suppliers directory..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSuppliers} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-[#263238] tracking-tight">Supplier Directory & Management</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage authorized vendors, performance ratings, contact records, and active procurement status
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E5E9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search suppliers by name, category, country, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] placeholder:text-[#667085]/60 transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-[#667085] whitespace-nowrap">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#172B4D] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#667085] hover:bg-[#E2E5E9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-[#E2E5E9]">
            <Truck className="w-8 h-8 text-[#667085] mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-[#263238]">No suppliers found</p>
            <p className="text-xs text-[#667085] mt-1">Try changing your search term or category filters.</p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl p-5 border border-[#E2E5E9] shadow-xs hover:border-[#2563A6]/40 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base" title={getCountryName(supplier.countryCode)}>
                        {getCountryFlag(supplier.countryCode)}
                      </span>
                      <h3 className="text-sm font-bold text-[#263238]">{supplier.name}</h3>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9] rounded">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] font-medium">
                      {supplier.companyName || supplier.category || 'Vendor'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      supplier.active !== false
                        ? 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9]'
                        : 'bg-[#F7F5F0] text-[#667085] border-[#E2E5E9]'
                    }`}
                  >
                    {supplier.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#667085] mb-4">
                  {(supplier.email || supplier.contactEmail) && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
                      <span className="truncate">{supplier.email || supplier.contactEmail}</span>
                    </div>
                  )}
                  {(supplier.phoneNumber || supplier.phone) && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
                      <span>
                        {supplier.phoneCountryCode
                          ? `${supplier.phoneCountryCode} ${supplier.phoneNumber || supplier.phone}`
                          : supplier.phone}
                      </span>
                    </div>
                  )}
                  {(supplier.addressLine1 || supplier.address) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
                      <span className="truncate">
                        {supplier.addressLine1
                          ? [supplier.addressLine1, supplier.city, supplier.countryCode].filter(Boolean).join(', ')
                          : supplier.address}
                      </span>
                    </div>
                  )}
                  {supplier.countryCode && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
                      <span className="font-medium text-[#263238]">
                        {ISO_COUNTRIES.find((c) => c.code === supplier.countryCode)?.name || supplier.countryCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E5E9] flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[#B9852C] text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{supplier.rating ?? 4.5}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="p-1.5 text-[#667085] hover:text-[#2563A6] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSupplierToDelete(supplier)}
                    className="p-1.5 text-[#667085] hover:text-[#B84C4C] hover:bg-[#FDF2F2] rounded-md transition cursor-pointer"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-[#E2E5E9] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#263238]">
                {editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Contact Name <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Company Name <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Industrial Supplies"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Email Address <span className="text-[#B84C4C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vendor@example.com"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Country <span className="text-[#B84C4C]">*</span>
                  </label>
                  <select
                    value={formData.countryCode}
                    onChange={(e) => {
                      const selectedCountry = e.target.value;
                      const matchedCountry = ISO_COUNTRIES.find((c) => c.code === selectedCountry);
                      setFormData({
                        ...formData,
                        countryCode: selectedCountry,
                        phoneCountryCode: matchedCountry ? matchedCountry.phoneCode : formData.phoneCountryCode,
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.phoneCountryCode}
                    onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                    className="w-28 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    {PHONE_COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="flex-1 text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="Street address or P.O. Box"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Suite, unit, building, floor"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">State / Province</label>
                  <input
                    type="text"
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#263238] mb-1">Status</label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#2563A6] hover:bg-[#1E528B] text-white rounded-lg shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSupplier ? 'Save Changes' : 'Create Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!supplierToDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${supplierToDelete?.name}"? Any active purchase orders associated with this supplier may be affected.`}
        type="danger"
        confirmText="Yes, Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setSupplierToDelete(null)}
      />
    </div>
  );
};

export default Suppliers;
