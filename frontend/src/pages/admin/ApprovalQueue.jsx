import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileDown,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { orderApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import OrderDetailModal from '../../components/OrderDetailModal';
import PurchaseOrderTable from '../../components/PurchaseOrderTable';

const ApprovalQueue = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Approval / Rejection Dialog States
  const [orderToApprove, setOrderToApprove] = useState(null);
  const [orderToReject, setOrderToReject] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getAll();
      const allOrders = res.data || [];
      // Filter strictly for PENDING orders in the approval queue
      const pending = allOrders.filter((o) => o.status === 'PENDING');
      setOrders(pending);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleApprove = async (remarks) => {
    if (!orderToApprove) return;
    try {
      setProcessing(true);
      await orderApi.updateStatus(orderToApprove.id, {
        status: 'APPROVED',
        remarks: remarks || 'Approved by Procurement Administrator',
      });
      showToast(`Purchase Order #${orderToApprove.orderNumber || orderToApprove.id} has been APPROVED!`);
      setOrderToApprove(null);
      fetchPendingOrders();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to approve order.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!orderToReject) return;
    try {
      setProcessing(true);
      await orderApi.updateStatus(orderToReject.id, {
        status: 'REJECTED',
        remarks: rejectionReason,
        rejectionReason: rejectionReason,
      });
      showToast(`Purchase Order #${orderToReject.orderNumber || orderToReject.id} has been REJECTED.`, 'info');
      setOrderToReject(null);
      fetchPendingOrders();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to reject order.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPdf = async (order) => {
    try {
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
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF.', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const num = (o.orderNumber || `PO #${o.id}`).toLowerCase();
    const sup = (o.supplier?.name || o.supplierName || '').toLowerCase();
    const buyer = (o.buyer?.fullName || o.buyerName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return num.includes(search) || sup.includes(search) || buyer.includes(search);
  });

  if (loading) {
    return <LoadingState message="Loading approval queue..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPendingOrders} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight">Purchase Order Approval Queue</h1>
          <p className="text-sm text-[#667085] mt-1">
            Review line items, authorize procurement requests, or reject orders with documented justifications
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-[#FCF7ED] border border-[#F5E6CC] text-[#8F651C] text-xs font-semibold rounded-lg shadow-xs">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Awaiting Review
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E5E9] shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter pending orders by order #, supplier, or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] placeholder:text-[#667085]/60 transition"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="All Caught Up!"
          description="There are currently no purchase orders pending review or approval."
        />
      ) : (
        <PurchaseOrderTable
          orders={filteredOrders}
          onViewOrder={(order) => setSelectedOrder(order)}
          onDownloadPdf={handleDownloadPdf}
          onApprove={(order) => setOrderToApprove(order)}
          onReject={(order) => setOrderToReject(order)}
        />
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={!!orderToApprove}
        title="Approve Purchase Order"
        message={`Authorize Purchase Order #${orderToApprove?.orderNumber || orderToApprove?.id} for vendor fulfillment?`}
        confirmText="Confirm Approval"
        type="success"
        requireRemarks={false}
        remarksLabel="Optional Approval Note"
        remarksPlaceholder="e.g. Budget authorized, standard terms apply"
        loading={processing}
        onConfirm={handleApprove}
        onClose={() => setOrderToApprove(null)}
      />

      {/* Reject Dialog (MANDATORY REMARKS) */}
      <ConfirmDialog
        isOpen={!!orderToReject}
        title="Reject Purchase Order"
        message={`Are you sure you want to reject Purchase Order #${orderToReject?.orderNumber || orderToReject?.id}? A reason is required and will be sent to the buyer.`}
        confirmText="Confirm Rejection"
        type="danger"
        requireRemarks={true}
        remarksLabel="Rejection Justification"
        remarksPlaceholder="State clearly why this order is rejected (e.g., Exceeds department quarterly budget)..."
        loading={processing}
        onConfirm={handleReject}
        onClose={() => setOrderToReject(null)}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        currentUserRole="ADMIN"
      />
    </div>
  );
};

export default ApprovalQueue;
