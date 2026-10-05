import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Search,
  FileDown,
  Eye,
  Clock,
  Building2,
} from 'lucide-react';
import { orderApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import OrderDetailModal from '../../components/OrderDetailModal';
import StatusBadge from '../../components/StatusBadge';

const AssignedOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delivery Action States
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [delivering, setDelivering] = useState(false);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const handleMarkAsDelivered = async (remarks) => {
    if (!orderToDeliver) return;
    try {
      setDelivering(true);
      await orderApi.updateStatus(orderToDeliver.id, {
        status: 'DELIVERED',
        remarks: remarks || 'Shipment delivered and confirmed by vendor',
        actualDeliveryDate: new Date().toISOString(),
      });
      showToast(`Order #${orderToDeliver.orderNumber || orderToDeliver.id} marked as DELIVERED!`);
      setOrderToDeliver(null);
      fetchAssignedOrders();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setDelivering(false);
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
      showToast('PDF invoice downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF.', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'ALL' || o.status === statusFilter;

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (o.orderNumber && o.orderNumber.toLowerCase().includes(search)) ||
      (o.buyer?.fullName && o.buyer.fullName.toLowerCase().includes(search)) ||
      (o.buyerName && o.buyerName.toLowerCase().includes(search));

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Loading vendor fulfillment queue..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAssignedOrders} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight">Assigned Purchase Orders</h1>
          <p className="text-sm text-[#667085] mt-1">
            Review orders assigned to your company, prepare shipments, and confirm deliveries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 bg-[#EDF5F0] border border-[#D1E7D9] text-[#2F6144] text-xs font-semibold rounded-lg shadow-xs">
            {orders.filter((o) => o.status === 'APPROVED').length} Ready to Deliver
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E5E9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by order number or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8F9FA] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] placeholder:text-[#667085]/60 transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'APPROVED', label: 'Ready for Delivery (Approved)' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'PENDING', label: 'Pending Approval' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#172B4D] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#667085] hover:bg-[#E2E5E9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assigned Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="There are no purchase orders matching your search or filter criteria."
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E5E9] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Buyer</th>
                  <th className="px-5 py-3.5">Order Date</th>
                  <th className="px-5 py-3.5">Expected Delivery</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
                {filteredOrders.map((order) => {
                  const buyerName =
                    order.buyer?.fullName || order.buyerName || order.createdBy?.fullName || 'Buyer';

                  return (
                    <tr key={order.id} className="hover:bg-[#F8F9FA] transition-colors duration-150">
                      <td className="px-5 py-3.5 font-semibold text-[#263238]">
                        {order.orderNumber || `PO #${order.id}`}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#263238]">{buyerName}</td>
                      <td className="px-5 py-3.5 text-[#667085] whitespace-nowrap">
                        {formatDate(order.orderDate || order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-[#667085] whitespace-nowrap">
                        {formatDate(order.expectedDeliveryDate || order.deliveryDate)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#263238] whitespace-nowrap">
                        {formatCurrency(order.totalAmount, order.currencyCode)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-[#667085] hover:text-[#2563A6] hover:bg-[#EAF2FA] rounded-lg transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDownloadPdf(order)}
                            className="p-1.5 text-[#667085] hover:text-[#3F7D5A] hover:bg-[#EDF5F0] rounded-lg transition cursor-pointer"
                            title="Download PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          {/* Strictly allow delivery update ONLY when APPROVED */}
                          {order.status === 'APPROVED' && (
                            <button
                              onClick={() => setOrderToDeliver(order)}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-[#3F7D5A] hover:bg-[#2F6144] text-white rounded-lg font-semibold text-[11px] shadow-xs transition cursor-pointer"
                              title="Mark as Delivered"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Deliver</span>
                            </button>
                          )}

                          {order.status === 'DELIVERED' && (
                            <span className="text-[11px] font-semibold text-[#3F7D5A] flex items-center space-x-1 px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </span>
                          )}

                          {order.status === 'PENDING' && (
                            <span className="text-[11px] text-[#B9852C] font-medium px-2 py-0.5">
                              Pending Admin
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark As Delivered Dialog */}
      <ConfirmDialog
        isOpen={!!orderToDeliver}
        title="Confirm Order Delivery"
        message={`Confirm that Purchase Order #${orderToDeliver?.orderNumber || orderToDeliver?.id} has been physically delivered to the designated receiving facility?`}
        confirmText="Confirm Delivery"
        type="success"
        requireRemarks={false}
        remarksLabel="Delivery Confirmation Notes (Optional)"
        remarksPlaceholder="e.g. Delivered via Freight Carrier, Tracking #1Z999..."
        loading={delivering}
        onConfirm={handleMarkAsDelivered}
        onClose={() => setOrderToDeliver(null)}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        currentUserRole="SUPPLIER"
      />
    </div>
  );
};

export default AssignedOrders;
