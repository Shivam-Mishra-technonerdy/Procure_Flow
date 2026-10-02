import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  ChevronDown,
  Check,
  X,
  Globe,
  Filter,
} from 'lucide-react';
import { supplierApi, orderApi } from '../../api';
import {
  formatCurrency,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  getCountryName,
  getCountryFlag,
} from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../components/LoadingState';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Target Supplier Search & Dropdown State
  const [supplierId, setSupplierId] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target)) {
        setIsSupplierDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form Fields - deliveryAddress strictly starts EMPTY per requirement
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [exchangeRateToInr, setExchangeRateToInr] = useState('1.000000');

  // Dynamic Line Items
  const [items, setItems] = useState([
    { itemName: '', description: '', quantity: 1, unitPrice: '' },
  ]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const res = await supplierApi.getAll();
        const all = res.data || [];
        // Filter for active suppliers only
        const activeSuppliers = all.filter((s) => s.active !== false);
        setSuppliers(activeSuppliers);
        if (activeSuppliers.length > 0) {
          setSupplierId(activeSuppliers[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to load active suppliers list.', 'error');
      } finally {
        setLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Filtered suppliers (all are verified production suppliers)
  const filteredSuppliers = suppliers.filter((s) => {
    if (!supplierSearch.trim()) return true;
    const q = supplierSearch.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(q);
    const companyMatch = s.companyName?.toLowerCase().includes(q);
    const categoryMatch = s.category?.toLowerCase().includes(q);
    const countryCodeMatch = s.countryCode?.toLowerCase().includes(q);
    const countryName = getCountryName(s.countryCode)?.toLowerCase() || '';
    const countryMatch = countryName.includes(q);
    const emailMatch = (s.contactEmail || s.email)?.toLowerCase().includes(q);
    return nameMatch || companyMatch || categoryMatch || countryCodeMatch || countryMatch || emailMatch;
  });

  const handleAddItem = () => {
    setItems([...items, { itemName: '', description: '', quantity: 1, unitPrice: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      showToast('Order must contain at least one line item.', 'info');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!supplierId) {
      setValidationError('Please select an active supplier.');
      return;
    }

    if (!expectedDeliveryDate) {
      setValidationError('Please specify an expected delivery date.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setValidationError('Please provide a delivery / receiving destination address.');
      return;
    }

    // Validate line items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.itemName.trim()) {
        setValidationError(`Item #${i + 1} requires an Item Name.`);
        return;
      }
      const qty = parseInt(it.quantity);
      if (isNaN(qty) || qty <= 0) {
        setValidationError(`Item #${i + 1} must have a valid quantity greater than 0.`);
        return;
      }
      const price = parseFloat(it.unitPrice);
      if (isNaN(price) || price <= 0) {
        setValidationError(`Item #${i + 1} must have a valid unit price greater than ${getCurrencySymbol(currencyCode)}0.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const parsedRate = currencyCode === 'USD' ? (parseFloat(exchangeRateToInr) || 83.50) : 1.0;
      const payload = {
        supplierId: parseInt(supplierId),
        deliveryDate: expectedDeliveryDate,
        expectedDeliveryDate: expectedDeliveryDate,
        deliveryAddress: deliveryAddress,
        notes: notes,
        remarks: notes,
        currencyCode: currencyCode,
        exchangeRateToInr: parsedRate,
        items: items.map((item) => ({
          itemName: item.itemName,
          itemDescription: item.description || item.itemName,
          description: item.description || item.itemName,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          currencyCode: currencyCode,
        })),
      };

      await orderApi.create(payload);
      showToast('Purchase order created and submitted for approval!');
      navigate('/buyer/orders');
    } catch (err) {
      console.error(err);
      setValidationError(err.response?.data?.message || 'Failed to submit purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSuppliers) {
    return <LoadingState message="Preparing purchase order workstation..." />;
  }

  const selectedSupplierObj = suppliers.find((s) => s.id.toString() === supplierId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/buyer/orders')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-[#667085] hover:text-[#263238] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E5E9] shadow-xs">
        <div className="border-b border-[#E2E5E9] pb-4 mb-6">
          <h1 className="text-xl font-bold text-[#263238]">Create Purchase Order</h1>
          <p className="text-xs text-[#667085] mt-1">
            Specify vendor, required delivery parameters, and detailed item requisitions
          </p>
        </div>

        {validationError && (
          <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl flex items-center space-x-3 text-xs text-[#B84C4C] font-medium">
            <AlertCircle className="w-5 h-5 text-[#B84C4C] flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Searchable Verified Target Supplier Selector */}
            <div className="relative" ref={supplierDropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#263238]">
                  Target Supplier <span className="text-[#B84C4C]">*</span>
                </label>
                <span className="text-[11px] font-medium text-[#3F7D5A] bg-[#EDF5F0] px-2 py-0.5 rounded border border-[#D1E7D9]">
                  {suppliers.length} Verified Suppliers
                </span>
              </div>

              {/* Selector Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                className={`w-full text-left p-2.5 bg-[#F7F5F0] border rounded-lg flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-[#2563A6] cursor-pointer ${
                  isSupplierDropdownOpen ? 'border-[#2563A6] ring-2 ring-[#EAF2FA] bg-white' : 'border-[#E2E5E9] hover:bg-[#F7F5F0]/80'
                }`}
              >
                {selectedSupplierObj ? (
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="text-base flex-shrink-0" title={getCountryName(selectedSupplierObj.countryCode)}>
                      {getCountryFlag(selectedSupplierObj.countryCode)}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-[#263238] truncate">
                          {selectedSupplierObj.name}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9] rounded">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] truncate">
                        {selectedSupplierObj.category} • {getCountryName(selectedSupplierObj.countryCode)} • {selectedSupplierObj.email || selectedSupplierObj.contactEmail}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-[#667085]">Select a verified supplier...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-[#667085] transition-transform ${isSupplierDropdownOpen ? 'rotate-180 text-[#2563A6]' : ''}`} />
              </button>

              {/* Dropdown Popover */}
              {isSupplierDropdownOpen && (
                <div className="absolute z-50 mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-[#E2E5E9] overflow-hidden">
                  {/* Search Bar & Directory Info */}
                  <div className="p-2.5 border-b border-[#E2E5E9] bg-[#F7F5F0] space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-2" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search by supplier name, category, or country..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] text-[#263238]"
                      />
                      {supplierSearch && (
                        <button
                          type="button"
                          onClick={() => setSupplierSearch('')}
                          className="absolute right-2.5 top-2 text-[#667085] hover:text-[#263238]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#667085] px-1">
                      <span>Showing {filteredSuppliers.length} verified supplier{filteredSuppliers.length === 1 ? '' : 's'}</span>
                      <span className="text-[10px] font-semibold text-[#3F7D5A] bg-[#EDF5F0] px-2 py-0.5 rounded border border-[#D1E7D9]">
                        Production Directory
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Verified Suppliers List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E5E9]">
                    {filteredSuppliers.length > 0 ? (
                      <div className="p-1">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2F6144] bg-[#EDF5F0] rounded-md flex items-center justify-between mb-1">
                          <span>Verified Suppliers ({filteredSuppliers.length})</span>
                          <span className="text-[9px] font-normal text-[#3F7D5A]">Active Procurement</span>
                        </div>
                        {filteredSuppliers.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSupplierId(s.id.toString());
                              setIsSupplierDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition mt-0.5 cursor-pointer ${
                              s.id.toString() === supplierId
                                ? 'bg-[#EAF2FA] border border-[#D0E2F5]'
                                : 'hover:bg-[#F7F5F0]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <span className="text-base flex-shrink-0" title={getCountryName(s.countryCode)}>
                                {getCountryFlag(s.countryCode)}
                              </span>
                              <div className="truncate">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xs font-bold text-[#263238] truncate">{s.name}</span>
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#EDF5F0] text-[#3F7D5A] rounded">
                                    Verified
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#667085] truncate">
                                  {s.category} • {getCountryName(s.countryCode) || s.countryCode || 'Global'} • {s.email || s.contactEmail}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <span className="text-[10px] font-semibold text-[#B9852C]">
                                ★ {s.rating || '4.5'}
                              </span>
                              {s.id.toString() === supplierId && (
                                <Check className="w-4 h-4 text-[#2563A6]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-[#667085]">
                        No verified suppliers match &ldquo;{supplierSearch}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Supplier Information Card */}
              {selectedSupplierObj && (
                <div className="mt-2 p-2.5 rounded-lg border border-[#D1E7D9] bg-[#EDF5F0]/50 text-[#263238] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="text-lg">{getCountryFlag(selectedSupplierObj.countryCode)}</span>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#263238] truncate">{selectedSupplierObj.name}</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9] rounded">
                          Verified Supplier
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] truncate mt-0.5">
                        {selectedSupplierObj.category} &bull; {getCountryName(selectedSupplierObj.countryCode)} ({selectedSupplierObj.countryCode}) &bull; {selectedSupplierObj.email || selectedSupplierObj.contactEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className="text-[11px] font-bold text-[#B9852C]">
                      ★ {selectedSupplierObj.rating || '4.5'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                Expected Delivery Date <span className="text-[#B84C4C]">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                Delivery / Receiving Destination <span className="text-[#B84C4C]">*</span>
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Corporate Receiving Bay 4, Industrial Area, Mumbai"
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                Internal Remarks / Delivery Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fragile items, deliver during standard receiving hours"
                className="w-full text-xs p-2.5 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition"
              />
            </div>
          </div>

          {/* Multi-Currency Selection & Snapshot Exchange Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F7F5F0] rounded-xl border border-[#E2E5E9]">
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                Order Currency <span className="text-[#B84C4C]">*</span>
              </label>
              <select
                value={currencyCode}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  setCurrencyCode(newCurr);
                  if (newCurr === 'USD') {
                    setExchangeRateToInr('83.500000');
                  } else {
                    setExchangeRateToInr('1.000000');
                  }
                }}
                className="w-full text-xs p-2.5 bg-white border border-[#E2E5E9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#2563A6] transition font-medium"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#667085] mt-1">
                Choose INR for domestic procurement or USD for international orders.
              </p>
            </div>

            {currencyCode === 'USD' ? (
              <div>
                <label className="block text-xs font-semibold text-[#263238] mb-1.5">
                  Exchange Rate Snapshot (1 USD = ₹ INR)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    value={exchangeRateToInr}
                    onChange={(e) => setExchangeRateToInr(e.target.value)}
                    placeholder="83.500000"
                    className="w-full text-xs p-2.5 bg-white border border-[#E2E5E9] rounded-lg focus:ring-2 focus:ring-[#2563A6] text-[#263238] transition font-mono font-medium"
                  />
                  <span className="text-xs text-[#667085] whitespace-nowrap font-medium">INR/USD</span>
                </div>
                <p className="text-[11px] text-[#667085] mt-1">
                  Snapshot conversion rate stored on order for reporting and financial rollups.
                </p>
              </div>
            ) : (
              <div className="flex items-center text-xs text-[#667085] pt-6">
                <span className="px-3 py-1.5 bg-[#E2E5E9]/60 rounded-lg text-[#263238] font-medium">
                  Base System Currency (₹ INR) • Exchange Rate: 1.000000
                </span>
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="pt-4 border-t border-[#E2E5E9]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                Purchase Order Line Items ({items.length}) • Currency: {currencyCode} ({getCurrencySymbol(currencyCode)})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#EAF2FA] hover:bg-[#D0E2F5] text-[#2563A6] rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const lineTotal =
                  (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div
                    key={index}
                    className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E2E5E9] flex flex-col md:flex-row items-start md:items-center gap-3"
                  >
                    <div className="w-6 text-center text-xs font-bold text-[#667085]">
                      #{index + 1}
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        required
                        placeholder="Item name / SKU *"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E2E5E9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#2563A6] transition"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Specification / description (optional)"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E2E5E9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#2563A6] transition"
                      />
                    </div>

                    <div className="w-24 w-full md:w-24">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E2E5E9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#2563A6] transition text-right"
                      />
                    </div>

                    <div className="w-32 w-full md:w-32">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-[#667085] font-bold">
                          {getCurrencySymbol(currencyCode)}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0.01"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full text-xs p-2 pl-7 bg-white border border-[#E2E5E9] text-[#263238] rounded-lg focus:ring-2 focus:ring-[#2563A6] transition text-right"
                        />
                      </div>
                    </div>

                    <div className="w-28 text-right font-bold text-xs text-[#263238] self-center">
                      {formatCurrency(lineTotal, currencyCode)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-[#667085] hover:text-[#B84C4C] hover:bg-[#FDF2F2] rounded-lg transition self-end md:self-auto cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-[#172B4D] text-white rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-slate-300">Order Pricing Structure</p>
              <p className="text-sm font-bold mt-0.5">Automated Tax Calculation Applied (8%)</p>
              {currencyCode === 'USD' && (
                <p className="text-xs text-[#EAF2FA] mt-1">
                  1 USD = ₹{(parseFloat(exchangeRateToInr) || 83.50).toFixed(2)} INR
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-right w-full md:w-auto">
              <div className="flex justify-between md:justify-end gap-6 text-slate-300">
                <span>Subtotal:</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal, currencyCode)}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-6 text-slate-300">
                <span>Estimated Tax (8%):</span>
                <span className="font-semibold text-white">{formatCurrency(tax, currencyCode)}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-6 text-base font-bold text-white pt-1.5 border-t border-white/20">
                <span>Total Amount:</span>
                <span className="text-[#EAF2FA]">{formatCurrency(grandTotal, currencyCode)}</span>
              </div>
              {currencyCode === 'USD' && (
                <div className="text-[11px] text-slate-300 pt-1 border-t border-white/20 flex justify-between md:justify-end gap-3">
                  <span>Base INR Equivalent:</span>
                  <span className="font-bold text-[#EAF2FA]">
                    {formatCurrency(grandTotal * (parseFloat(exchangeRateToInr) || 83.50), 'INR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E2E5E9]">
            <button
              type="button"
              onClick={() => navigate('/buyer/orders')}
              className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
