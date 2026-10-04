import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  PlusCircle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  FileText,
  DollarSign,
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
  const totalValue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

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
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-[#667085]">
                    You have not created any purchase orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#263238]">
                      {order.orderNumber || `PO #${order.id}`}
                    </td>
                    <td className="px-4 py-3">
                      {order.supplier?.name || order.supplierName || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#667085]">
                      {formatDate(order.orderDate || order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#263238]">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#2563A6] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
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
