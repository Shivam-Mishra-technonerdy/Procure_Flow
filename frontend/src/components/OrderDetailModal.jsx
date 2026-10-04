import React, { useState } from 'react';
import {
  X,
  FileDown,
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils/formatters';
import { orderApi } from '../api';
import { useToast } from '../context/ToastContext';

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
  currentUserRole,
}) => {
  const { showToast } = useToast();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen || !order) return null;

  const orderCurrency = order.currencyCode || 'INR';

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await orderApi.downloadPdf(order.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO-${order.orderNumber || order.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('PDF invoice downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF invoice.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Determine timeline steps
  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Awaiting Admin Review' },
    {
      key: 'APPROVED',
      label: order.status === 'REJECTED' ? 'Order Rejected' : 'Approved',
      desc: order.status === 'REJECTED' ? 'Rejected by Admin' : 'Dispatched to Supplier',
    },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Goods Received & Closed' },
  ];

  const getStepStatus = (stepKey) => {
    if (order.status === 'REJECTED') {
      if (stepKey === 'PENDING') return 'completed';
      if (stepKey === 'APPROVED') return 'rejected';
      return 'upcoming';
    }
    if (order.status === 'DELIVERED') return 'completed';
    if (order.status === 'APPROVED') {
      if (stepKey === 'DELIVERED') return 'upcoming';
      return 'completed';
    }
    // PENDING
    if (stepKey === 'PENDING') return 'active';
    return 'upcoming';
  };

  const items = order.items || order.orderItems || [];
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.subtotal) || (parseFloat(item.quantity) * parseFloat(item.unitPrice)) || 0),
    0
  );
  const tax = order.taxAmount != null ? order.taxAmount : calculatedSubtotal * 0.08;
  const total = order.totalAmount != null ? order.totalAmount : calculatedSubtotal + tax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-[#E2E5E9] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#172B4D] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-[#EAF2FA]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-bold tracking-tight">
                  {order.orderNumber || `PO #${order.id}`}
                </h3>
                <StatusBadge status={order.status} />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-[#EAF2FA] border border-white/10 font-mono">
                  {orderCurrency}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Created on {formatDate(order.orderDate || order.createdAt, true)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Lifecycle Progress */}
          <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E2E5E9]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-3">
              Order Workflow Status
            </h4>
            <div className="grid grid-cols-3 gap-2 relative">
              {steps.map((step, idx) => {
                const state = getStepStatus(step.key);
                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                        state === 'completed'
                          ? 'bg-[#3F7D5A] text-white'
                          : state === 'active'
                          ? 'bg-[#2563A6] text-white ring-4 ring-[#EAF2FA]'
                          : state === 'rejected'
                          ? 'bg-[#B84C4C] text-white'
                          : 'bg-[#E2E5E9] text-[#667085]'
                      }`}
                    >
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : state === 'rejected' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#263238]">{step.label}</span>
                    <span className="text-[10px] text-[#667085]">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier and Buyer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E2E5E9] shadow-xs">
              <div className="flex items-center space-x-2 text-[#667085] mb-2">
                <Building2 className="w-4 h-4 text-[#172B4D]" />
                <h5 className="text-[11px] font-bold uppercase tracking-wider">Supplier Details</h5>
              </div>
              <p className="text-sm font-bold text-[#263238]">
                {order.supplier?.name || order.supplierName || 'Verified Supplier'}
              </p>
              <p className="text-xs text-[#667085] mt-0.5">
                {order.supplier?.companyName || order.supplier?.category || 'Hardware & Components'}
              </p>
              <div className="mt-2 text-xs text-[#667085] space-y-0.5">
                {order.supplier?.email && <p>Email: {order.supplier.email}</p>}
                {order.supplier?.phone && <p>Phone: {order.supplier.phone}</p>}
                {order.supplier?.address && <p>Address: {order.supplier.address}</p>}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E5E9] shadow-xs">
              <div className="flex items-center space-x-2 text-[#667085] mb-2">
                <User className="w-4 h-4 text-[#172B4D]" />
                <h5 className="text-[11px] font-bold uppercase tracking-wider">Buyer / Creator</h5>
              </div>
              <p className="text-sm font-bold text-[#263238]">
                {order.buyer?.fullName || order.buyerName || order.createdBy?.fullName || 'Procurement Officer'}
              </p>
              <p className="text-xs text-[#667085] mt-0.5">
                Email: {order.buyer?.email || order.buyerEmail || order.createdBy?.email || 'buyer@example.com'}
              </p>
              <div className="mt-2 text-xs text-[#667085] space-y-0.5">
                <p>Expected Delivery: {formatDate(order.expectedDeliveryDate || order.deliveryDate)}</p>
                {order.actualDeliveryDate && (
                  <p className="text-[#3F7D5A] font-semibold">
                    Actual Delivery: {formatDate(order.actualDeliveryDate, true)}
                  </p>
                )}
                {order.deliveryAddress && (
                  <div className="flex items-start space-x-1.5 text-[#263238] font-medium pt-1.5 border-t border-[#E2E5E9] mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2563A6] flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">
                      <span className="text-[#667085] font-normal">Delivery Destination: </span>
                      {order.deliveryAddress}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#E2E5E9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-[#F7F5F0] border-b border-[#E2E5E9] flex justify-between items-center">
              <h5 className="text-[11px] font-bold text-[#263238] uppercase tracking-wider">
                Order Line Items ({items.length})
              </h5>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Item & Description</th>
                    <th className="px-4 py-2.5 text-right">Quantity</th>
                    <th className="px-4 py-2.5 text-right">Unit Price ({getCurrencySymbol(orderCurrency)})</th>
                    <th className="px-4 py-2.5 text-right">Subtotal ({getCurrencySymbol(orderCurrency)})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
                  {items.map((item, index) => {
                    const itemCurr = item.currencyCode || orderCurrency;
                    const itemSubtotal =
                      item.subtotal != null
                        ? item.subtotal
                        : (item.quantity || 0) * (item.unitPrice || 0);
                    return (
                      <tr key={item.id || index} className="hover:bg-[#F7F5F0]/50 transition-colors">
                        <td className="px-4 py-3 text-[#667085] font-medium">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#263238]">{item.itemName || item.itemDescription || 'Standard Item'}</p>
                          {item.description && item.description !== item.itemName && (
                            <p className="text-[11px] text-[#667085]">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice, itemCurr)}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#263238]">
                          {formatCurrency(itemSubtotal, itemCurr)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-[#F7F5F0] px-6 py-4 border-t border-[#E2E5E9]">
              <div className="max-w-xs ml-auto space-y-1.5 text-xs">
                <div className="flex justify-between text-[#667085]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#263238]">{formatCurrency(calculatedSubtotal, orderCurrency)}</span>
                </div>
                <div className="flex justify-between text-[#667085]">
                  <span>Estimated Tax (8%):</span>
                  <span className="font-semibold text-[#263238]">{formatCurrency(tax, orderCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#263238] pt-2 border-t border-[#E2E5E9]">
                  <span>Grand Total:</span>
                  <span className="text-[#2563A6]">{formatCurrency(total, orderCurrency)}</span>
                </div>
                {orderCurrency === 'USD' && (
                  <div className="flex justify-between text-xs font-semibold text-[#667085] pt-1 border-t border-[#E2E5E9]">
                    <span>Base INR Equivalent:</span>
                    <span className="text-[#263238]">
                      {formatCurrency(total * (parseFloat(order.exchangeRateToInr) || 83.50), 'INR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes & Remarks Section */}
          {(order.remarks || order.rejectionReason || order.notes) && (
            <div className="p-4 rounded-xl bg-[#FCF7ED] border border-[#F5E6CC]">
              <div className="flex items-center space-x-2 text-[#B9852C] mb-1">
                <AlertCircle className="w-4 h-4" />
                <h5 className="text-[11px] font-bold uppercase tracking-wider">Remarks / Special Notes</h5>
              </div>
              <p className="text-xs text-[#8F651C] leading-relaxed whitespace-pre-wrap">
                {order.rejectionReason || order.remarks || order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F7F5F0] border-t border-[#E2E5E9] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-[#E2E5E9] text-[#263238] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
