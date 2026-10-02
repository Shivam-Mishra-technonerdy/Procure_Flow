import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supplierApi, orderApi } from '../api/client';
import {
  ShoppingCart,
  Plus,
  Trash2,
  ArrowLeft,
  Building,
  CheckCircle2
} from 'lucide-react';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSupplierId = searchParams.get('supplierId') || '';

  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(defaultSupplierId);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { itemDescription: '', quantity: 1, unitPrice: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supplierApi.getAll()
      .then((res) => {
        const activeSuppliers = res.data.filter((s) => s.status === 'ACTIVE');
        setSuppliers(activeSuppliers);
        if (!supplierId && activeSuppliers.length > 0) {
          setSupplierId(activeSuppliers[0].id);
        }
      })
      .catch((err) => console.error('Failed to load suppliers', err));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { itemDescription: '', quantity: 1, unitPrice: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      alert('A purchase order must contain at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemDescription.trim()) {
        setError(`Item #${i + 1} must have a valid description.`);
        return;
      }
      if (items[i].quantity <= 0) {
        setError(`Item #${i + 1} quantity must be at least 1.`);
        return;
      }
      if (parseFloat(items[i].unitPrice) <= 0 || isNaN(parseFloat(items[i].unitPrice))) {
        setError(`Item #${i + 1} unit price must be greater than 0.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        deliveryAddress,
        expectedDeliveryDate: expectedDeliveryDate || null,
        notes,
        items: items.map((it) => ({
          itemDescription: it.itemDescription.trim(),
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
        })),
      };

      await orderApi.create(payload);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit purchase order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Purchase Orders
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Purchase Order</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select an authorized vendor, add required inventory line items, and submit for administrator approval
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600" />
            <span>Vendor & Delivery Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Supplier *</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="">Choose an active supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery / Ship-To Address *</label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Thakur College of Engineering, Mumbai, Maharashtra"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requisition Notes & Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special handling instructions, certified vendor paperwork, delivery dock access notes..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-sky-600" />
              <span>Line Items Breakdown</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 w-24">Qty</th>
                  <th className="p-2.5 w-32">Unit Price ($)</th>
                  <th className="p-2.5 w-28 text-right">Subtotal</th>
                  <th className="p-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const lineSub = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                  return (
                    <tr key={index}>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Industrial Air Filter Model X-200"
                          value={item.itemDescription}
                          onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-right"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold text-xs text-slate-800">
                        ${lineSub.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal:</span>
                <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Tax (8%):</span>
                <span className="font-medium text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-sky-700">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/orders"
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Submitting PO...' : 'Submit Purchase Order'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;