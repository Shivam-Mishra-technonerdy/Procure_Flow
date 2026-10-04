import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  FileDown,
  Eye,
  Filter,
} from 'lucide-react';
import { orderApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import PurchaseOrderTable from '../../components/PurchaseOrderTable';
import OrderDetailModal from '../../components/OrderDetailModal';

const MyOrders = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      (o.supplier?.name && o.supplier.name.toLowerCase().includes(search)) ||
      (o.supplierName && o.supplierName.toLowerCase().includes(search));

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Loading your purchase orders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight">My Purchase Orders</h1>
          <p className="text-sm text-[#667085] mt-1">
            Track requisition statuses, inspect vendor fulfillments, and download authorized PDF documents
          </p>
        </div>

        <button
          onClick={() => navigate('/buyer/orders/create')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E5E9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by order number or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] placeholder:text-[#667085]/60 transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'DELIVERED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#172B4D] text-white shadow-xs'
                  : 'bg-[#F7F5F0] text-[#667085] hover:bg-[#E2E5E9]'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Orders Found"
          description="You don't have any purchase orders matching the current search criteria."
          action={
            <button
              onClick={() => navigate('/buyer/orders/create')}
              className="px-4 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              Create New Order Now
            </button>
          }
        />
      ) : (
        <PurchaseOrderTable
          orders={filteredOrders}
          showBuyerColumn={false}
          onViewOrder={(order) => setSelectedOrder(order)}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        currentUserRole="BUYER"
      />
    </div>
  );
};

export default MyOrders;
