import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  PlusCircle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { orderApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import OrderDetailModal from '../../components/OrderDetailModal';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to retrieve your purchase order records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingState message="Loading procurement portal..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const approvedCount = orders.filter((o) => o.status === 'APPROVED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238]">Buyer Procurement Desk</h1>
          <p className="text-sm text-[#667085] mt-1">
            Manage purchase requisitions, track vendor fulfillment, and inspect issued PO documents
          </p>
        </div>

        <button
          onClick={() => navigate('/buyer/orders/create')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Visual Workflow Steps Panel */}
      <div className="bg-white rounded-xl border border-[#E2E5E9] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
            Procurement Lifecycle Workflow
          </span>
          <span className="text-[11px] font-semibold text-[#2563A6]">
            Requisition to Receipt
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <div className="p-3 rounded-lg bg-[#EAF2FA] border border-[#D0E2F5] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#2563A6] uppercase tracking-wider">Step 1</span>
            <p className="text-xs font-bold text-[#172B4D] mt-1">Create PO</p>
            <p className="text-[10px] text-[#667085] mt-0.5">Start requisition</p>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#E2E5E9] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Step 2</span>
            <p className="text-xs font-bold text-[#263238] mt-1">Select Supplier</p>
            <p className="text-[10px] text-[#667085] mt-0.5">Choose verified vendor</p>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#E2E5E9] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Step 3</span>
            <p className="text-xs font-bold text-[#263238] mt-1">Enter Details</p>
            <p className="text-[10px] text-[#667085] mt-0.5">Items & destination</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FCF7ED] border border-[#F5E6CC] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#B9852C] uppercase tracking-wider">Step 4</span>
            <p className="text-xs font-bold text-[#8F651C] mt-1">Admin Review</p>
            <p className="text-[10px] text-[#667085] mt-0.5">Approval verification</p>
          </div>
          <div className="p-3 rounded-lg bg-[#EDF5F0] border border-[#D1E7D9] flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#3F7D5A] uppercase tracking-wider">Step 5</span>
            <p className="text-xs font-bold text-[#2F6144] mt-1">Fulfillment</p>
            <p className="text-[10px] text-[#667085] mt-0.5">Vendor delivery</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="blue"
          trend="All time orders"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={Clock}
          color="amber"
          trend="Awaiting review"
        />
        <StatCard
          title="In Fulfillment"
          value={approvedCount}
          icon={Truck}
          color="navy"
          trend="Dispatched to vendor"
        />
        <StatCard
          title="Completed & Delivered"
          value={deliveredCount}
          icon={CheckCircle2}
          color="sage"
          trend="Successfully received"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E5E9] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#263238]">Recent Purchase Orders</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Latest requisitions and orders placed under your account
            </p>
          </div>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="text-xs font-semibold text-[#2563A6] hover:text-[#1E528B] flex items-center space-x-1 cursor-pointer"
          >
            <span>View All My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Order Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-[#667085]">
                    You have not created any purchase orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F5F0]/70 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-semibold text-[#263238]">
                      {order.orderNumber || `PO #${order.id}`}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#263238]">
                      {order.supplier?.name || order.supplierName || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[#667085] whitespace-nowrap">
                      {formatDate(order.orderDate || order.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#263238] whitespace-nowrap">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 text-xs font-semibold text-[#2563A6] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default BuyerDashboard;
